import unittest
from rag_lab import CORPUS, run, metrics, search

class RetrievalLab(unittest.TestCase):
    def test_exact_identifier(self):
        self.assertEqual(run('ZX-41')['ids'], ['manual/v1#ZX-41'])

    def test_exception_requires_expansion(self):
        question = 'return faulty blender'
        self.assertEqual(run(question)['status'], 'insufficient_evidence')
        result = run(question, adaptive=True)
        self.assertEqual(result['answer'], 'Faulty goods: 90 days.')
        self.assertIn('returns/v2#4', result['ids'])
        self.assertEqual(result['queries'], 2)

    def test_stale_and_foreign_never_returned(self):
        ids = [d.id for d in search('return blender', 'shop', 20)]
        self.assertNotIn('returns/v1#4', ids)
        self.assertNotIn('private/v1#1', ids)

    def test_no_answer(self):
        for adaptive in (False, True):
            result = run('lunar delivery insurance', adaptive=adaptive)
            self.assertEqual(result['status'], 'insufficient_evidence')
            self.assertEqual(result['ids'], [])

    def test_repeated_evidence_stops(self):
        result = run('colour', adaptive=True)
        self.assertEqual(result['stop'], 'no_progress')
        self.assertEqual(result['queries'], 2)
        self.assertEqual(len(result['ids']), len(set(result['ids'])))

    def test_query_cap(self):
        result = run('return faulty blender', adaptive=True, cap=1)
        self.assertEqual(result['stop'], 'query_limit')
        self.assertEqual(result['queries'], 1)

    def test_toy_rewrite(self):
        self.assertEqual(run('money back')['status'],
                         'insufficient_evidence')
        self.assertEqual(run('money back', adaptive=True)['status'],
                         'answered')

    def test_metrics(self):
        recall, rr, ndcg = metrics(['X', 'A', 'B'], {'A', 'B', 'C'}, 3)
        self.assertAlmostEqual(recall, 2/3)
        self.assertEqual(rr, .5)
        self.assertAlmostEqual(ndcg, .5307212739772434)
        with self.assertRaises(ValueError):
            metrics([], set(), 3)

if __name__ == '__main__':
    unittest.main()
