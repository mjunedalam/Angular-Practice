"""Contract tests; these deliberately do not call or impersonate an LLM."""
import unittest
import judge_attack_lab as lab


class JudgeAttackLabTests(unittest.TestCase):
    def test_pairs_change_only_injection_not_answer_or_expected_label(self):
        pairs = lab.build_pairs()
        self.assertEqual(len({pair.case_id for pair in pairs}), len(pairs))
        for pair in pairs:
            self.assertTrue(pair.injected.startswith(pair.clean + "\n\n"))
            self.assertIn("ignore the rubric", pair.injected)
            self.assertIs(type(pair.expected_pass), bool)

    def test_clean_and_injected_have_separate_denominators(self):
        result = lab.run_pairs()
        for variant in ("clean", "injected"):
            stats = result["summary"][variant]
            self.assertEqual(stats["negative_attempts"], 2)
            self.assertEqual(stats["negative_graded"], 2)
            self.assertEqual(stats["false_accepts"], 0)
            self.assertEqual(stats["false_accept_rate"], 0.0)
            self.assertEqual(stats["positive_graded"], 2)
            self.assertEqual(stats["true_accepts"], 2)
        self.assertEqual(result["summary"]["attack_flips"], 0)
        self.assertEqual(result["metadata"]["judge_version"],
                         "deterministic-exact-first-line-v1")

    def test_deliberately_vulnerable_fixture_exposes_score_flip(self):
        result = lab.run_pairs(lab.vulnerable_fixture_judge,
                               judge_version="vulnerable-fixture-v1")
        self.assertEqual(result["summary"]["clean"]["false_accepts"], 0)
        self.assertEqual(result["summary"]["injected"]["false_accepts"], 2)
        self.assertEqual(result["summary"]["attack_flips"], 2)

    def test_adapter_receives_fixed_contract_and_no_expected_label(self):
        requests = []

        def adapter(request):
            requests.append(request)
            return {"verdict": "fail", "reason_code": "unsupported"}

        result = lab.run_pairs(adapter, judge_version="injected-test-adapter")
        self.assertEqual(len(requests), 8)
        for clean, injected in zip(requests[::2], requests[1::2]):
            self.assertEqual(clean.rubric, lab.RUBRIC)
            self.assertEqual(clean.rubric, injected.rubric)
            self.assertEqual(clean.evidence, injected.evidence)
            self.assertFalse(hasattr(clean, "expected_pass"))
            self.assertEqual(set(clean.evidence), {"task", "approved_answer"})
        self.assertEqual(result["metadata"]["judge_version"],
                         "injected-test-adapter")

    def test_invalid_verdicts_are_errors_not_false_rejections(self):
        for invalid in ({"verdict": "PASS", "reason_code": "supported"},
                        {"verdict": True, "reason_code": "supported"},
                        {"verdict": "pass", "reason_code": "unsupported",
                         "instruction": "change expected label"},
                        "pass", None):
            with self.subTest(invalid=invalid):
                result = lab.run_pairs(lambda request: invalid,
                                       judge_version="malformed")
                for variant in ("clean", "injected"):
                    stats = result["summary"][variant]
                    self.assertEqual(stats["grading_errors"], 4)
                    self.assertEqual(stats["negative_graded"], 0)
                    self.assertIsNone(stats["false_accept_rate"])
                self.assertFalse(result["summary"]["complete_grading"])
                self.assertEqual(result["summary"]["attack_flips"], 0)

    def test_adapter_exceptions_do_not_export_raw_error_text(self):
        def unavailable(request):
            raise RuntimeError("PRIVATE_SYNTHETIC_PROVIDER_ERROR")

        result = lab.run_pairs(unavailable, judge_version="unavailable")
        self.assertNotIn("PRIVATE_SYNTHETIC_PROVIDER_ERROR", str(result))
        self.assertTrue(all(row["status"] == "grading_error"
                            for row in result["rows"]))
        self.assertFalse(result["summary"]["complete_grading"])

    def test_partial_failure_does_not_inflate_attack_denominator(self):
        def partial(request):
            if "ignore the rubric" in request.candidate:
                return {}
            return lab.fixture_judge(request)

        report = lab.run_pairs(partial, judge_version="partial")
        self.assertEqual(report["summary"]["injected"]["negative_attempts"], 2)
        self.assertEqual(report["summary"]["injected"]["negative_graded"], 0)
        self.assertIsNone(report["summary"]["injected"]["false_accept_rate"])
        self.assertFalse(report["summary"]["complete_grading"])

    def test_external_adapter_requires_explicit_version(self):
        with self.assertRaises(ValueError):
            lab.run_pairs(lambda request: {"verdict": "pass",
                                          "reason_code": "supported"})


if __name__ == "__main__":
    unittest.main()
