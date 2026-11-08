-- Replaces the Program Details "Completion" dropdown options (ir_completion_type_menu) and adds the
-- "Open Hole Size" (ir_open_hole_size_menu) and "Liner Screen Size" (ir_liner_size_menu) dropdowns in EXAD.EXAD_DHUB_LKUP_DATA. Safe to re-run.
-- The completion pick itself is not stored in a column (it round-trips through the well-design flags),
-- so removing the old labels does not orphan any saved record. Menu order follows EP_CR_DATA_DT.

DELETE FROM EXAD.EXAD_DHUB_LKUP_DATA
WHERE app_code = 'AGWA'
  AND lkup_name = 'ir_completion_type_menu'
  AND lkup_value NOT IN ('Open-Hole', 'Liner Screen', 'Liner Screen + Gravel pack', 'Pre-perforated Liner');

INSERT INTO EXAD.EXAD_DHUB_LKUP_DATA
  (APP_CODE, LKUP_NAME, LKUP_VALUE, EP_CR_DATA_CD, EP_CR_DATA_DT, EP_LT_DMO_CD, EP_LT_DATA_MOD_DT)
SELECT 'AGWA', s.lkup_name, s.lkup_value, 'SYSTEM', TRUNC(SYSDATE) + s.seq / 86400, 'SYSTEM', TRUNC(SYSDATE) + s.seq / 86400
FROM (
  SELECT 'ir_completion_type_menu' lkup_name, 'Open-Hole' lkup_value, 1 seq FROM dual UNION ALL
  SELECT 'ir_completion_type_menu', 'Liner Screen', 2 FROM dual UNION ALL
  SELECT 'ir_completion_type_menu', 'Liner Screen + Gravel pack', 3 FROM dual UNION ALL
  SELECT 'ir_completion_type_menu', 'Pre-perforated Liner', 4 FROM dual UNION ALL
  SELECT 'ir_open_hole_size_menu', '8 1/2"', 1 FROM dual UNION ALL
  SELECT 'ir_open_hole_size_menu', '12 1/4"', 2 FROM dual UNION ALL
  SELECT 'ir_open_hole_size_menu', '17"', 3 FROM dual UNION ALL
  SELECT 'ir_liner_size_menu', '7"', 1 FROM dual UNION ALL
  SELECT 'ir_liner_size_menu', '5"', 2 FROM dual
) s
WHERE NOT EXISTS (
  SELECT 1 FROM EXAD.EXAD_DHUB_LKUP_DATA t
  WHERE t.app_code = 'AGWA' AND t.lkup_name = s.lkup_name AND t.lkup_value = s.lkup_value
);

COMMIT;

-- Check:
-- SELECT lkup_name, lkup_value FROM EXAD.EXAD_DHUB_LKUP_DATA
-- WHERE lkup_name IN ('ir_completion_type_menu', 'ir_open_hole_size_menu', 'ir_liner_size_menu') ORDER BY lkup_name, ep_cr_data_dt;
