"""Execute actual chapter listings; no copied implementations."""
import pathlib
import re
import unittest

CHAPTERS = pathlib.Path(__file__).resolve().parents[1] / 'chapters'

class ContextRegression(unittest.TestCase):
    def setUp(self):
        text = (CHAPTERS / '08.md').read_text()
        block = next(b for b in re.findall(r'```python\n(.*?)```', text, re.S)
                     if 'def select_context' in b)
        scope = {}
        exec(block, scope)
        self.select = scope['select_context']

    def item(self, name, size, priority, required=False):
        return dict(id=name, text=name * size, source=name,
                    priority=priority, required=required)

    def test_optional_cannot_crowd_out_required(self):
        items = [self.item('O', 60, 0), self.item('R', 50, 1, True)]
        text, manifest = self.select(items, len, 100, 0, 0)
        self.assertEqual(text, ['R' * 50])
        self.assertEqual(manifest, [dict(id='R', source='R', tokens=50)])

    def test_required_set_must_fit_together(self):
        items = [self.item('A', 60, 0, True),
                 self.item('B', 50, 1, True)]
        with self.assertRaises(ValueError):
            self.select(items, len, 100, 0, 0)

    def test_final_order_and_overhead(self):
        items = [self.item('R', 20, 2, True), self.item('O', 30, 1)]
        text, manifest = self.select(items, len, 70, 10, 10)
        self.assertEqual([m['id'] for m in manifest], ['O', 'R'])
        self.assertEqual(sum(m['tokens'] for m in manifest), 50)

    def test_retry_wording(self):
        text = (CHAPTERS / '01.md').read_text()
        self.assertIn('four total attempts', text)
        self.assertNotIn('SDK retries four times', text)

class RankFusionRegression(unittest.TestCase):
    def test_duplicate_ids_do_not_change_fused_order(self):
        text = (CHAPTERS / '12.md').read_text()
        block = next(b for b in re.findall(r'```python\n(.*?)```', text, re.S)
                     if 'def reciprocal_rank_fusion' in b)
        scope = {}
        exec(block, scope)
        fuse = scope['reciprocal_rank_fusion']
        expected = fuse([['B', 'A'], ['A', 'B']])
        self.assertEqual(expected, ['A', 'B'])
        for lists in ([['B', 'B', 'A'], ['A', 'B']],
                      [['B', 'A'], ['A', 'A', 'B']]):
            with self.subTest(lists=lists):
                self.assertEqual(fuse(lists), expected)

class MCPTransportSmoke(unittest.TestCase):
    def test_extracted_stdio_pair(self):
        import importlib.util
        import subprocess
        import sys
        import tempfile
        if importlib.util.find_spec('mcp') is None:
            self.skipTest('optional mcp==2.3.0 environment required')
        blocks = re.findall(r'```python\n(.*?)```',
                            (CHAPTERS / '14.md').read_text(), re.S)
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            (root / 'observability_server.py').write_text(blocks[0])
            (root / 'inspect_observability.py').write_text(
                blocks[1] + '\n' + blocks[2])
            result = subprocess.run(
                [sys.executable, str(root / 'inspect_observability.py')],
                capture_output=True, text=True, timeout=20, check=True)
            import ast
            data = ast.literal_eval(result.stdout.strip())
            self.assertTrue(data['synthetic'])
            self.assertEqual(data['quantiles_ms']['p95'], 1800)
            self.assertEqual(data['service'], 'checkout-api')

if __name__ == '__main__':
    unittest.main()
