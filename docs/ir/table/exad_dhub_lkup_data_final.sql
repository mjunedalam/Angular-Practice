-- FINAL lookup-data script for the IR module — EXAD.EXAD_DHUB_LKUP_DATA (APP_CODE = 'AGWA').
-- Run this ONE script on any environment (fresh or already seeded). It is safe to re-run.
--   1. Renames the legacy un-prefixed menus (completion_menu, ...) to the ir_ names, if any still exist.
--   2. Removes obsolete values: the old Completion options (Screen, Screen with Gravel Pack, Pre-Perforated
--      Liner, Perforated Liner) and the old singular notify key (ir_notify_cc_recipient).
--   3. Inserts every menu below; a (APP_CODE, LKUP_NAME, LKUP_VALUE) that already exists is skipped.
-- Menu order in the app follows EP_CR_DATA_DT, so each value gets its own second offset.
-- Change 'SYSTEM' to your user id if audit columns should show who ran it.
-- Supersedes: exad_dhub_lkup_data_insert.sql, _add_completion_type_menu.sql, _update_completion_menus.sql, _rename_ir_prefix.sql.

-- 1. Legacy names -> ir_ names
UPDATE EXAD.EXAD_DHUB_LKUP_DATA
SET LKUP_NAME = 'ir_' || LKUP_NAME, EP_LT_DMO_CD = 'SYSTEM', EP_LT_DATA_MOD_DT = SYSDATE
WHERE APP_CODE = 'AGWA'
  AND LKUP_NAME IN ('completion_menu', 'acidization_menu', 'transmission_menu', 'logging_menu',
                    'mud_logging_menu', 'sampling_menu', 'flow_test_menu', 'dev_testing_menu');

-- 2. Obsolete values (the completion pick is not stored in a column — it round-trips through the
--    well-design flags — so removing the old labels orphans no saved record)
DELETE FROM EXAD.EXAD_DHUB_LKUP_DATA
WHERE APP_CODE = 'AGWA'
  AND LKUP_NAME = 'ir_completion_type_menu'
  AND LKUP_VALUE NOT IN ('Open-Hole', 'Liner Screen', 'Liner Screen + Gravel pack', 'Pre-perforated Liner');

DELETE FROM EXAD.EXAD_DHUB_LKUP_DATA
WHERE APP_CODE = 'AGWA' AND LKUP_NAME = 'ir_notify_cc_recipient';

-- 3. All menus
INSERT INTO EXAD.EXAD_DHUB_LKUP_DATA
  (APP_CODE, LKUP_NAME, LKUP_VALUE, EP_CR_DATA_CD, EP_CR_DATA_DT, EP_LT_DMO_CD, EP_LT_DATA_MOD_DT)
SELECT 'AGWA', s.lkup_name, s.lkup_value, 'SYSTEM', TRUNC(SYSDATE) + s.seq / 86400, 'SYSTEM', TRUNC(SYSDATE) + s.seq / 86400
FROM (
  -- Completion
  SELECT 'ir_completion_menu' lkup_name, 'Open Hole' lkup_value, 1 seq FROM dual UNION ALL
  SELECT 'ir_completion_menu', 'Screened', 2 FROM dual UNION ALL
  SELECT 'ir_completion_menu', 'Screened + Gravel Pack', 3 FROM dual UNION ALL
  SELECT 'ir_completion_menu', 'Liner + Perforated', 4 FROM dual UNION ALL
  -- Completion type (the single-pick "Completion" dropdown; ir_completion_menu above feeds "Completion Remarks")
  SELECT 'ir_completion_type_menu', 'Open-Hole', 1 FROM dual UNION ALL
  SELECT 'ir_completion_type_menu', 'Liner Screen', 2 FROM dual UNION ALL
  SELECT 'ir_completion_type_menu', 'Liner Screen + Gravel pack', 3 FROM dual UNION ALL
  SELECT 'ir_completion_type_menu', 'Pre-perforated Liner', 4 FROM dual UNION ALL
  -- Open hole size (drawn with every completion pick)
  SELECT 'ir_open_hole_size_menu', '8 1/2"', 1 FROM dual UNION ALL
  SELECT 'ir_open_hole_size_menu', '12 1/4"', 2 FROM dual UNION ALL
  SELECT 'ir_open_hole_size_menu', '17"', 3 FROM dual UNION ALL
  -- Liner screen size (Liner Screen / Liner Screen + Gravel pack / Pre-perforated Liner)
  SELECT 'ir_liner_size_menu', '7"', 1 FROM dual UNION ALL
  SELECT 'ir_liner_size_menu', '5"', 2 FROM dual UNION ALL
  -- Acidization
  SELECT 'ir_acidization_menu', 'HCl Acid Wash', 1 FROM dual UNION ALL
  SELECT 'ir_acidization_menu', 'Mud Acid', 2 FROM dual UNION ALL
  SELECT 'ir_acidization_menu', 'None', 3 FROM dual UNION ALL
  -- Transmission
  SELECT 'ir_transmission_menu', 'Gravity Flow', 1 FROM dual UNION ALL
  SELECT 'ir_transmission_menu', 'Pumped Transmission', 2 FROM dual UNION ALL
  SELECT 'ir_transmission_menu', 'Pipeline', 3 FROM dual UNION ALL
  SELECT 'ir_transmission_menu', 'Tanker', 4 FROM dual UNION ALL
  -- Logging
  SELECT 'ir_logging_menu', 'Caliper', 1 FROM dual UNION ALL
  SELECT 'ir_logging_menu', 'Gamma Ray', 2 FROM dual UNION ALL
  SELECT 'ir_logging_menu', 'Resistivity', 3 FROM dual UNION ALL
  SELECT 'ir_logging_menu', 'SP', 4 FROM dual UNION ALL
  -- Mud Logging
  SELECT 'ir_mud_logging_menu', 'Full Mud Logging', 1 FROM dual UNION ALL
  SELECT 'ir_mud_logging_menu', 'Cuttings Sample Only', 2 FROM dual UNION ALL
  SELECT 'ir_mud_logging_menu', 'None', 3 FROM dual UNION ALL
  -- Sampling
  SELECT 'ir_sampling_menu', 'Bailer Sample', 1 FROM dual UNION ALL
  SELECT 'ir_sampling_menu', 'Pump Sample', 2 FROM dual UNION ALL
  SELECT 'ir_sampling_menu', 'Composite Sample', 3 FROM dual UNION ALL
  -- Flow Test
  SELECT 'ir_flow_test_menu', 'Step-Rate Test', 1 FROM dual UNION ALL
  SELECT 'ir_flow_test_menu', 'Constant-Rate Test', 2 FROM dual UNION ALL
  SELECT 'ir_flow_test_menu', 'Recovery Test', 3 FROM dual UNION ALL
  -- Development/Testing
  SELECT 'ir_dev_testing_menu', 'Step Drawdown Test', 1 FROM dual UNION ALL
  SELECT 'ir_dev_testing_menu', 'Constant Rate Test', 2 FROM dual UNION ALL
  SELECT 'ir_dev_testing_menu', 'Recovery Test', 3 FROM dual UNION ALL
  SELECT 'ir_dev_testing_menu', 'Aquifer Performance Test (APT)', 4 FROM dual UNION ALL
  SELECT 'ir_dev_testing_menu', 'Slug Test', 5 FROM dual UNION ALL
  SELECT 'ir_dev_testing_menu', 'Bailer Test', 6 FROM dual UNION ALL
  SELECT 'ir_dev_testing_menu', 'Air Lift Development', 7 FROM dual UNION ALL
  SELECT 'ir_dev_testing_menu', 'Surge Block Development', 8 FROM dual
  UNION ALL
  -- Casing table "Type" dropdown
  SELECT 'ir_casing_type_menu', 'Conductor', 1 FROM dual UNION ALL
  SELECT 'ir_casing_type_menu', 'Casing', 2 FROM dual UNION ALL
  SELECT 'ir_casing_type_menu', 'Liner', 3 FROM dual UNION ALL
  -- Casing table "Size" dropdown (bare inch sizes, as csg_size is stored)
  SELECT 'ir_casing_size_menu', '36', 1 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '30', 2 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '26', 3 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '24', 4 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '20', 5 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '18 5/8', 6 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '18', 7 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '15', 8 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '13 3/8', 9 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '9 5/8', 10 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '9', 11 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '7', 12 FROM dual UNION ALL
  SELECT 'ir_casing_size_menu', '5', 13 FROM dual UNION ALL
  -- "Notify" email recipients for an IR (To / CC) — one row per address; replace or add addresses as needed
  SELECT 'ir_notify_to_recipients', 'alammx1o@aramco.com', 1 FROM dual UNION ALL
  SELECT 'ir_notify_cc_recipients', 'alammx1o@aramco.com', 1 FROM dual
) s
WHERE NOT EXISTS (
  SELECT 1 FROM EXAD.EXAD_DHUB_LKUP_DATA t
  WHERE t.app_code = 'AGWA' AND t.lkup_name = s.lkup_name AND t.lkup_value = s.lkup_value
);

COMMIT;

-- Check:
-- SELECT lkup_name, COUNT(*) FROM EXAD.EXAD_DHUB_LKUP_DATA WHERE app_code = 'AGWA' GROUP BY lkup_name ORDER BY 1;
-- SELECT lkup_name, lkup_value FROM EXAD.EXAD_DHUB_LKUP_DATA
--  WHERE lkup_name IN ('ir_completion_type_menu','ir_open_hole_size_menu','ir_liner_size_menu','ir_notify_to_recipients','ir_notify_cc_recipients')
--  ORDER BY lkup_name, ep_cr_data_dt;
