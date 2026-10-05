-- Seeds EXAD.EXAD_DHUB_LKUP_DATA with the IR Program Details dropdown options (APP_CODE = 'AGWA').
-- Safe to re-run: a (APP_CODE, LKUP_NAME, LKUP_VALUE) row that already exists is skipped.
-- Menu order in the app follows EP_CR_DATA_DT, so each value gets its own second offset.
-- Change 'SYSTEM' to your user id if audit columns should show who ran it.

INSERT INTO EXAD.EXAD_DHUB_LKUP_DATA
  (APP_CODE, LKUP_NAME, LKUP_VALUE, EP_CR_DATA_CD, EP_CR_DATA_DT, EP_LT_DMO_CD, EP_LT_DATA_MOD_DT)
SELECT 'AGWA', s.lkup_name, s.lkup_value, 'SYSTEM', TRUNC(SYSDATE) + s.seq / 86400, 'SYSTEM', TRUNC(SYSDATE) + s.seq / 86400
FROM (
  -- Completion
  SELECT 'completion_menu' lkup_name, 'Open Hole' lkup_value, 1 seq FROM dual UNION ALL
  SELECT 'completion_menu', 'Screened', 2 FROM dual UNION ALL
  SELECT 'completion_menu', 'Screened + Gravel Pack', 3 FROM dual UNION ALL
  SELECT 'completion_menu', 'Liner + Perforated', 4 FROM dual UNION ALL
  -- Acidization
  SELECT 'acidization_menu', 'HCl Acid Wash', 1 FROM dual UNION ALL
  SELECT 'acidization_menu', 'Mud Acid', 2 FROM dual UNION ALL
  SELECT 'acidization_menu', 'None', 3 FROM dual UNION ALL
  -- Transmission
  SELECT 'transmission_menu', 'Gravity Flow', 1 FROM dual UNION ALL
  SELECT 'transmission_menu', 'Pumped Transmission', 2 FROM dual UNION ALL
  SELECT 'transmission_menu', 'Pipeline', 3 FROM dual UNION ALL
  SELECT 'transmission_menu', 'Tanker', 4 FROM dual UNION ALL
  -- Logging
  SELECT 'logging_menu', 'Caliper', 1 FROM dual UNION ALL
  SELECT 'logging_menu', 'Gamma Ray', 2 FROM dual UNION ALL
  SELECT 'logging_menu', 'Resistivity', 3 FROM dual UNION ALL
  SELECT 'logging_menu', 'SP', 4 FROM dual UNION ALL
  -- Mud Logging
  SELECT 'mud_logging_menu', 'Full Mud Logging', 1 FROM dual UNION ALL
  SELECT 'mud_logging_menu', 'Cuttings Sample Only', 2 FROM dual UNION ALL
  SELECT 'mud_logging_menu', 'None', 3 FROM dual UNION ALL
  -- Sampling
  SELECT 'sampling_menu', 'Bailer Sample', 1 FROM dual UNION ALL
  SELECT 'sampling_menu', 'Pump Sample', 2 FROM dual UNION ALL
  SELECT 'sampling_menu', 'Composite Sample', 3 FROM dual UNION ALL
  -- Flow Test
  SELECT 'flow_test_menu', 'Step-Rate Test', 1 FROM dual UNION ALL
  SELECT 'flow_test_menu', 'Constant-Rate Test', 2 FROM dual UNION ALL
  SELECT 'flow_test_menu', 'Recovery Test', 3 FROM dual UNION ALL
  -- Development/Testing
  SELECT 'dev_testing_menu', 'Step Drawdown Test', 1 FROM dual UNION ALL
  SELECT 'dev_testing_menu', 'Constant Rate Test', 2 FROM dual UNION ALL
  SELECT 'dev_testing_menu', 'Recovery Test', 3 FROM dual UNION ALL
  SELECT 'dev_testing_menu', 'Aquifer Performance Test (APT)', 4 FROM dual UNION ALL
  SELECT 'dev_testing_menu', 'Slug Test', 5 FROM dual UNION ALL
  SELECT 'dev_testing_menu', 'Bailer Test', 6 FROM dual UNION ALL
  SELECT 'dev_testing_menu', 'Air Lift Development', 7 FROM dual UNION ALL
  SELECT 'dev_testing_menu', 'Surge Block Development', 8 FROM dual
) s
WHERE NOT EXISTS (
  SELECT 1 FROM EXAD.EXAD_DHUB_LKUP_DATA t
  WHERE t.app_code = 'AGWA' AND t.lkup_name = s.lkup_name AND t.lkup_value = s.lkup_value
);

COMMIT;
