"""Deterministic lexical retrieval teaching lab, corpus edition 2026-10-17.
No embedding model, LLM, live store, learned reranker or benchmark claim.
"""
from dataclasses import dataclass
from math import log2
import re

EDITION = 'toy-policy-2026-10-17'

@dataclass(frozen=True)
class Document:
    id: str
    text: str
    tenant: str = 'shop'
    current: bool = True
    parent: str | None = None

CORPUS = (
    Document('returns/v2#4a', 'return faulty blender unused goods',
             parent='returns/v2#4'),
    Document('returns/v2#4',
             'Policy section 4: unused goods 30 days; faulty goods 90 days.'),
    Document('catalog/v1#blender', 'blender colour red return packaging'),
    Document('manual/v1#ZX-41', 'ZX-41 reset: disconnect power for 60 seconds.'),
    Document('returns/v1#4', 'return faulty blender 7 days', current=False),
    Document('private/v1#1', 'return faulty blender unlimited days', tenant='other'),
)

def tokens(text):
    return set(re.findall(r'[a-z0-9]+(?:-[a-z0-9]+)*', text.lower()))


def search(question, tenant='shop', k=2):
    query = tokens(question)
    eligible = [d for d in CORPUS if d.tenant == tenant and d.current]
    scored = [(len(query & tokens(d.text)), d) for d in eligible]
    return [d for score, d in sorted(scored, key=lambda x: (-x[0], x[1].id))
            if score > 0][:k]


def interpret(question, ledger):
    """Fixture-specific support checks, deliberately not general entailment."""
    words = tokens(question)
    if 'zx-41' in words and 'manual/v1#ZX-41' in ledger:
        return 'Disconnect power for 60 seconds.'
    if ('return' in words or {'money', 'back'} <= words):
        if 'returns/v2#4' in ledger:
            if 'faulty' in words:
                return 'Faulty goods: 90 days.'
            if 'unused' in words or {'money', 'back'} <= words:
                return 'Unused goods: 30 days.'
    return None


def run(question, adaptive=False, cap=3, tenant='shop'):
    if type(cap) is not int or cap < 1:
        raise ValueError('cap must be a positive integer')
    ledger, trace = {}, []
    query = question
    pending_parent = None
    queries = 0
    stop = 'query_limit'
    answer = None
    while queries < (cap if adaptive else 1):
        # A parent lookup is a backend operation and consumes one query.
        if pending_parent:
            candidates = [d for d in CORPUS if d.id == pending_parent
                          and d.tenant == tenant and d.current]
            operation = 'parent:' + pending_parent
        else:
            candidates = search(query, tenant)
            operation = 'search:' + query
        queries += 1
        added = [d.id for d in candidates if d.id not in ledger]
        ledger.update({d.id: d for d in candidates})
        trace.append((operation, added))
        answer = interpret(question, ledger)
        if answer:
            stop = 'sufficient'
            break
        if not adaptive:
            stop = 'fixed_complete'
            break
        if queries > 1 and not added:
            stop = 'no_progress'
            break
        pending_parent = next((d.parent for d in ledger.values()
                               if d.parent and d.parent not in ledger), None)
        if not pending_parent and {'money', 'back'} <= tokens(question):
            query = 'return unused goods'
    return dict(status='answered' if answer else 'insufficient_evidence',
                answer=answer, ids=list(ledger), queries=queries,
                stop=stop, trace=trace)


def metrics(ranked, relevant, k):
    if not relevant or k < 1:
        raise ValueError('nonempty relevant labels and positive k required')
    unique = list(dict.fromkeys(ranked))[:k]
    labels = [int(x in relevant) for x in unique]
    recall = sum(labels) / len(relevant)
    rr = next((1 / rank for rank, rel in enumerate(labels, 1) if rel), 0)
    dcg = sum(rel / log2(rank + 1) for rank, rel in enumerate(labels, 1))
    ideal = sum(1 / log2(rank + 1)
                for rank in range(1, min(k, len(relevant)) + 1))
    return recall, rr, dcg / ideal


def main():
    print('corpus=' + EDITION + '; lexical/toy controller; no LLM')
    for question in ('ZX-41', 'return faulty blender', 'money back',
                     'lunar delivery insurance', 'colour'):
        for adaptive in (False, True):
            result = run(question, adaptive)
            mode = 'adaptive' if adaptive else 'fixed'
            print(f'{mode} | {question} | {result["status"]} | '
                  f'queries={result["queries"]} | {result["stop"]}')
    scores = metrics(['X', 'A', 'B'], {'A', 'B', 'C'}, 3)
    print('worked recall=%.6f RR=%.6f nDCG=%.6f' % scores)

if __name__ == '__main__':
    main()
