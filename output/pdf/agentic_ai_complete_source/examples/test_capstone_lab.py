import asyncio
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import capstone_lab as lab

class CapstoneTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.folder = self.tmp.name
        self.db = self.folder+'/domain.sqlite'
        lab.initialize(self.db)

    def run_cli(self, mode, crash=False):
        env = dict(os.environ, CAPSTONE_CRASH_AFTER_COMMIT='1' if crash else '0')
        return subprocess.run([sys.executable, str(Path(lab.__file__)),
                               self.folder, mode], env=env, capture_output=True, text=True)

    def test_real_process_loss_and_duplicate(self):
        self.assertEqual(self.run_cli('start').stdout.strip(), 'paused')
        self.assertEqual(self.run_cli('approve', True).returncode, 73)
        self.assertEqual(self.run_cli('resume').stdout.strip(), 'recovered')
        self.assertEqual(self.run_cli('resume').stdout.strip(), 'recovered')
        with lab.database(self.db) as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM effects').fetchone()[0], 1)

    def test_restart_with_competing_revision_requires_reconciliation(self):
        self.assertEqual(self.run_cli('start').stdout.strip(), 'paused')
        self.assertEqual(self.run_cli('approve', True).returncode, 73)
        with lab.database(self.db) as db:
            db.execute('UPDATE desired SET rev="git-42"')
            db.commit()
            accepted = db.execute('SELECT id,digest,revision,completed '
                                  'FROM effects').fetchone()
        result = self.run_cli('resume')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), 'reconciliation-required')
        self.assertEqual(self.run_cli('resume').stdout.strip(),
                         'reconciliation-required')
        with lab.graph_at(self.folder) as graph:
            state = graph.get_state({'configurable': {
                'thread_id': 'lab:inc-7:graph-v1'}}).values
            self.assertEqual(state['effect_id'], accepted[0])
            self.assertEqual(state['status'], 'reconciliation-required')
        with lab.database(self.db) as db:
            self.assertEqual(db.execute('SELECT id,digest,revision,completed '
                                        'FROM effects').fetchall(), [accepted])
            self.assertIsNone(accepted[3])
            self.assertEqual(db.execute('SELECT rev FROM desired').fetchone()[0],
                             'git-42')

    def test_approval_binding_and_order(self):
        approval = lab.approve(self.db)
        with self.assertRaises(ValueError):
            lab.apply(self.db, {**lab.PROPOSAL,'target':'other'}, approval)
        with self.assertRaises(ValueError):
            lab.apply(self.db, lab.PROPOSAL, approval, now=9)
        with self.assertRaises(ValueError):
            lab.apply(self.db, lab.PROPOSAL, approval, now=100)

    def test_supersession_conflict_and_cancellation(self):
        approval = lab.approve(self.db)
        with lab.database(self.db) as db:
            db.execute('UPDATE active SET digest="new"'); db.commit()
        with self.assertRaisesRegex(ValueError,'superseded'):
            lab.apply(self.db, lab.PROPOSAL, approval)
        with lab.database(self.db) as db:
            db.execute('UPDATE active SET digest=?',(lab.digest(lab.PROPOSAL),))
            db.execute('UPDATE desired SET rev="concurrent"'); db.commit()
        with self.assertRaisesRegex(ValueError,'revision'):
            lab.apply(self.db, lab.PROPOSAL, approval)
        with lab.database(self.db) as db:
            db.execute('UPDATE control SET cancelled=1'); db.commit()
        with self.assertRaisesRegex(ValueError,'cancelled'):
            lab.apply(self.db, lab.PROPOSAL, approval)

    def test_commit_is_not_completion(self):
        effect = lab.apply(self.db, lab.PROPOSAL, lab.approve(self.db))
        self.assertIsNone(lab.reconcile(self.db, effect, 'wrong'))
        with lab.database(self.db) as db:
            self.assertIsNone(db.execute('SELECT completed FROM effects').fetchone()[0])

    def test_independent_window(self):
        rows = lab.fixture()
        self.assertEqual(lab.verify(rows,37,666),'pending')
        self.assertEqual(lab.verify(rows,37,667),'recovered')
        self.assertEqual(lab.verify(rows[:-1],37,667),'insufficient')
        rows[0]['errors'] = 5
        self.assertEqual(lab.verify(rows,37,667),'failed')
        rows[0]['errors'] = 0
        rows[0]['evidence'] = ''
        self.assertEqual(lab.verify(rows,37,667),'insufficient')
        rows[0]['evidence'] = 'metrics-0'
        rows[0]['requests'] = float('nan')
        self.assertEqual(lab.verify(rows,37,667),'insufficient')
        rows[0]['requests'] = -1
        self.assertEqual(lab.verify(rows,37,667),'insufficient')

    def test_late_data_and_histogram_units(self):
        rows = lab.fixture()
        status, buckets = lab.covered_window(rows,37,667)
        self.assertEqual(buckets[0]['p95_upper_ms'],200)
        self.assertEqual(lab.aggregate_histograms([[45,49,50],[45,49,50]]), [90,98,100])
        self.assertEqual(lab.verify(rows,37,667,alerts_ok=False),'failed')
        self.assertEqual(lab.verify(rows,37,667,dependencies_ok=False),'failed')
        rows[0]['available'] = 668
        self.assertEqual(lab.verify(rows,37,667),'insufficient')
        rows[0]['available'] = 127
        rows[0]['histogram'] = [98,90,100]  # Counter/reset inconsistency.
        self.assertEqual(lab.verify(rows,37,667),'insufficient')

    def test_invalid_observation_times_cannot_establish_recovery(self):
        invalid = [float('nan'), float('inf'), float('-inf'),
                   None, '667', True, -1]
        for value in invalid:
            for clock in ('completed', 'now'):
                with self.subTest(clock=clock, value=value):
                    times = {'completed': 37, 'now': 667, clock: value}
                    self.assertEqual(lab.verify(lab.fixture(), **times),
                                     'insufficient')
            for field in ('start', 'end', 'available'):
                with self.subTest(field=field, value=value):
                    rows = lab.fixture()
                    rows[-1][field] = value
                    self.assertEqual(lab.verify(rows, 37, 667), 'insufficient')
        rows = lab.fixture()
        rows[-1]['available'] = rows[-1]['end'] - 1
        self.assertEqual(lab.verify(rows, 37, 667), 'insufficient')
        # Whole-interval availability may equal its end. The separate global
        # watermark still applies; fractional seconds use the same clock.
        rows = lab.fixture(37.25)
        rows[-1]['available'] = rows[-1]['end']
        self.assertEqual(lab.verify(rows, 37.25, 667.24), 'pending')
        self.assertEqual(lab.verify(rows, 37.25, 667.25), 'recovered')

    def test_temporal_activity_boundary_without_server(self):
        from capstone_temporal import graph_step, IncidentWorkflow
        self.assertEqual(asyncio.run(graph_step({'folder':self.folder})),'paused')
        decision = lab.approve(self.db)
        wf = IncidentWorkflow()
        wf.approval_recorded(decision)
        wf.approval_recorded('duplicate-is-ignored')
        self.assertEqual(wf.decision, decision)
        self.assertEqual(asyncio.run(graph_step({'folder':self.folder,
                                               'decision':decision})),'recovered')
        self.assertEqual(asyncio.run(graph_step({'folder':self.folder,
                                               'decision':decision})),'recovered')

if __name__ == '__main__':
    unittest.main()
