"""Real LangGraph, local-only GitOps simulation; no provider or cluster."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from math import isfinite
import sqlite3
from contextlib import contextmanager
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt
from langgraph.checkpoint.sqlite import SqliteSaver

PROPOSAL = dict(incident='inc-7', tenant='lab', service='order-api',
                expected='git-41', target='image-40', version=1,
                environment='simulation', risk=4, operation='rollback',
                evidence=['release-41'], verification='ten-covered-minutes',
                rollback_plan='reviewed-new-proposal')
ACTION_TIME = 37  # 00:00:37, deliberately between minute boundaries

def digest(p):
    return hashlib.sha256(json.dumps(p, sort_keys=True).encode()).hexdigest()

@contextmanager
def database(path):
    conn = sqlite3.connect(path)
    try:
        conn.executescript('''
        CREATE TABLE IF NOT EXISTS desired(service TEXT PRIMARY KEY, rev TEXT);
        INSERT OR IGNORE INTO desired VALUES ('order-api','git-41');
        CREATE TABLE IF NOT EXISTS active(incident TEXT PRIMARY KEY, digest TEXT);
        CREATE TABLE IF NOT EXISTS approvals(id TEXT PRIMARY KEY, digest TEXT,
          approvers TEXT, decided INTEGER, expires INTEGER);
        CREATE TABLE IF NOT EXISTS effects(id TEXT PRIMARY KEY, digest TEXT,
          revision TEXT, completed INTEGER);
        CREATE TABLE IF NOT EXISTS control(cancelled INTEGER);
        INSERT INTO control SELECT 0 WHERE NOT EXISTS(SELECT 1 FROM control);
        ''')
        conn.commit()
        yield conn
    finally:
        conn.close()

def initialize(path):
    with database(path) as db:
        db.execute('INSERT OR IGNORE INTO active VALUES (?,?)',
                   ('inc-7', digest(PROPOSAL)))
        db.commit()

def approve(path, proposal=PROPOSAL, approvers=('alice','bob'), now=10):
    # Trusted external approval-service fixture, never model-supplied identity.
    if len(set(approvers)) != 2:
        raise ValueError('risk 4 requires two distinct privileged approvers')
    if not set(approvers) <= {'alice', 'bob', 'carol'}:
        raise ValueError('unprivileged approver')
    with database(path) as db:
        db.execute('INSERT INTO approvals VALUES (?,?,?,?,?)',
                   ('approval-7', digest(proposal), json.dumps(approvers), now, 100))
        db.commit()
    return 'approval-7'

def apply(path, proposal, approval_id, now=20):
    """One local transaction models a change service's conditional mutation."""
    binding = digest(proposal)
    effect_id = 'effect:' + binding
    with database(path) as db:
        db.execute('BEGIN IMMEDIATE')
        existing = db.execute('SELECT digest FROM effects WHERE id=?',
                              (effect_id,)).fetchone()
        if existing:
            if existing[0] != binding:
                raise ValueError('effect identity conflict')
            return effect_id  # Reconcile accepted work, even after expiry.
        if db.execute('SELECT cancelled FROM control').fetchone()[0]:
            raise ValueError('cancelled before submission')
        active = db.execute('SELECT digest FROM active WHERE incident=?',
                            (proposal['incident'],)).fetchone()
        if not active or active[0] != binding:
            raise ValueError('superseded proposal')
        row = db.execute('SELECT digest,approvers,decided,expires FROM approvals '
                         'WHERE id=?', (approval_id,)).fetchone()
        if not row or row[0] != binding or not row[2] <= now < row[3]:
            raise ValueError('approval binding or validity')
        if len(set(json.loads(row[1]))) != 2:
            raise ValueError('approval quorum')
        revision = 'commit:' + binding[:12]
        changed = db.execute('UPDATE desired SET rev=? WHERE service=? AND rev=?',
                             (revision, proposal['service'], proposal['expected']))
        if changed.rowcount != 1:
            raise ValueError('desired revision conflict')
        db.execute('INSERT INTO effects VALUES (?,?,?,NULL)',
                   (effect_id, binding, revision))
        db.commit()
    return effect_id

def reconcile(path, effect_id, observed_revision=None, ready=True):
    with database(path) as db:
        row = db.execute('SELECT revision,completed FROM effects WHERE id=?',
                         (effect_id,)).fetchone()
        current = db.execute('SELECT rev FROM desired WHERE service="order-api"').fetchone()[0]
        if row and row[0] == current == observed_revision and ready:
            db.execute('UPDATE effects SET completed=? WHERE id=?',
                       (ACTION_TIME, effect_id))
            db.commit()
            return ACTION_TIME
        return None

def aggregate_histograms(shards):
    """Compatible cumulative per-interval bucket increases from two instances."""
    if not shards or any(len(h) != 3 or
            any(not isfinite(v) or v < 0 for v in h) or
            h != sorted(h) for h in shards):
        raise ValueError('invalid histogram or counter reset')
    return [sum(h[i] for h in shards) for i in range(3)]

def fixture(completed=ACTION_TIME):
    # Exact interval query results, NOT interpolated minute scrapes.
    return [dict(start=completed+60*i, end=completed+60*(i+1),
                 service='order-api', tenant='lab', requests=100, errors=0,
                 histogram=aggregate_histograms([[45,49,50],[45,49,50]]), bounds=[.1, .2, float('inf')],
                 available=completed+60*(i+1)+30, evidence=f'metrics-{i}')
            for i in range(10)]

def covered_window(rows, completed, now):
    # All times use finite nonnegative seconds on the same fixture clock.
    # An entire interval cannot be available before its end; the separate
    # ingestion watermark below can require waiting beyond that availability.
    def valid_seconds(value):
        return (type(value) in (int, float) and value >= 0
                and (type(value) is int or isfinite(value)))
    if not valid_seconds(completed) or not valid_seconds(now):
        return 'insufficient', []
    for row in rows:
        if any(not valid_seconds(row.get(field))
               for field in ('start', 'end', 'available')):
            return 'insufficient', []
        if not row['start'] < row['end'] <= row['available']:
            return 'insufficient', []
    if now < completed+600+30:
        return 'pending', []  # Explicit 30-second ingestion watermark.
    buckets = []
    for i in range(10):
        matches = [r for r in rows if r['start'] == completed+60*i
                   and r['end'] == completed+60*(i+1)]
        if len(matches) != 1:
            return 'insufficient', []
        r = matches[0]
        h, b = r['histogram'], r['bounds']
        if (not r['evidence'] or r['available'] > now or r['tenant'] != 'lab'
                or r['service'] != 'order-api' or not isfinite(r['requests']) or not isfinite(r['errors'])
                or r['requests'] < 100
                or not 0 <= r['errors'] <= r['requests']
                or len(h) != 3 or b != [.1, .2, float('inf')]
                or any(not isfinite(v) for v in h)
                or not 0 <= h[0] <= h[1] <= h[2] == r['requests']):
            return 'insufficient', []
        # Aggregate compatible cumulative histograms upstream, never instance p95.
        # Conservative bucket upper bound, not invented quantile precision.
        upper = next(bound for count, bound in zip(h,b)
                     if count >= .95*r['requests'])
        buckets.append(dict(error_rate=r['errors']/r['requests'],
                            p95_upper_ms=upper*1000, evidence=r['evidence']))
    return 'covered', buckets

def verify(rows, completed, now, alerts_ok=True, dependencies_ok=True):
    status, buckets = covered_window(rows, completed, now)
    if status != 'covered':
        return status
    return ('recovered' if all(b['error_rate'] <= .005 and
            b['p95_upper_ms'] <= 300 for b in buckets)
            and alerts_ok and dependencies_ok else 'failed')

class State(TypedDict, total=False):
    proposal: dict
    approval_id: str
    effect_id: str
    status: str

@contextmanager
def graph_at(folder):
    path = folder + '/domain.sqlite'
    initialize(path)
    def gather(state):
        return {'proposal': PROPOSAL, 'status': 'evidence:release-41'}
    def review(state):
        approval_id = interrupt({'proposal': state['proposal'],
                                 'digest': digest(state['proposal'])})
        return {'approval_id': approval_id}
    def execute(state):
        effect = apply(path, state['proposal'], state['approval_id'])
        if os.environ.get('CAPSTONE_CRASH_AFTER_COMMIT') == '1':
            os._exit(73)
        return {'effect_id': effect, 'status': 'desired-state-committed'}
    def observe(state):
        with database(path) as db:
            revision = db.execute('SELECT revision FROM effects WHERE id=?',
                                  (state['effect_id'],)).fetchone()[0]
        completed = reconcile(path, state['effect_id'], revision)
        if completed is None:
            # Accepted effect remains evidence; never query a recovery window
            # without confirmed completion. Explicit handoff, not resolution.
            return {'status': 'reconciliation-required'}
        return {'status': verify(fixture(completed), completed, 667,
                                 alerts_ok=True, dependencies_ok=True)}
    builder = StateGraph(State)
    for name, fn in [('gather',gather),('review',review),
                     ('execute',execute),('observe',observe)]:
        builder.add_node(name, fn)
    for a,b in [(START,'gather'),('gather','review'),('review','execute'),
                ('execute','observe'),('observe',END)]:
        builder.add_edge(a,b)
    with SqliteSaver.from_conn_string(folder+'/graph.sqlite') as saver:
        yield builder.compile(checkpointer=saver)

def step(folder, decision=None):
    """Bounded activity boundary: reload checkpoint on every invocation."""
    os.makedirs(folder, exist_ok=True)
    config = {'configurable': {'thread_id': 'lab:inc-7:graph-v1'}}
    with graph_at(folder) as graph:
        snapshot = graph.get_state(config)
        if not snapshot.values:
            result = graph.invoke({}, config)
        elif not snapshot.next:
            result = snapshot.values
        elif snapshot.tasks and any(t.interrupts for t in snapshot.tasks):
            if decision is None:
                return 'paused'
            result = graph.invoke(Command(resume=decision), config)
        else:
            result = graph.invoke(None, config)  # Interrupted/crashed node retry.
        return 'paused' if '__interrupt__' in result else result['status']

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('folder')
    parser.add_argument('mode', choices=['start','approve','resume'])
    args = parser.parse_args()
    decision = None
    if args.mode == 'approve':
        decision = approve(args.folder+'/domain.sqlite')
    print(step(args.folder, decision))
