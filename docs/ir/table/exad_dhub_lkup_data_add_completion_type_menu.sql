-- (Superseded by exad_dhub_lkup_data_update_completion_menus.sql, which also adds the Open Hole Size menu.)
-- Adds only the new Program Details "Completion" dropdown options (menu ir_completion_type_menu) to
-- EXAD.EXAD_DHUB_LKUP_DATA. Safe to re-run: a (APP_CODE, LKUP_NAME, LKUP_VALUE) row that already exists is skipped.
-- Menu order in the app follows EP_CR_DATA_DT, so each value gets its own second offset.
-- (The same rows are also part of exad_dhub_lkup_data_insert.sql, which seeds a fresh environment in one go.)

INSERT INTO EXAD.EXAD_DHUB_LKUP_DATA
  (APP_CODE, LKUP_NAME, LKUP_VALUE, EP_CR_DATA_CD, EP_CR_DATA_DT, EP_LT_DMO_CD, EP_LT_DATA_MOD_DT)
SELECT 'AGWA', s.lkup_name, s.lkup_value, 'SYSTEM', TRUNC(SYSDATE) + s.seq / 86400, 'SYSTEM', TRUNC(SYSDATE) + s.seq / 86400
FROM (
  SELECT 'ir_completion_type_menu' lkup_name, 'Open-Hole' lkup_value, 1 seq FROM dual UNION ALL
  SELECT 'ir_completion_type_menu', 'Liner Screen', 2 FROM dual UNION ALL
  SELECT 'ir_completion_type_menu', 'Liner Screen + Gravel pack', 3 FROM dual UNION ALL
  SELECT 'ir_completion_type_menu', 'Pre-perforated Liner', 4 FROM dual
) s
WHERE NOT EXISTS (
  SELECT 1 FROM EXAD.EXAD_DHUB_LKUP_DATA t
  WHERE t.app_code = 'AGWA' AND t.lkup_name = s.lkup_name AND t.lkup_value = s.lkup_value
);

COMMIT;

-- Check:
-- SELECT lkup_name, lkup_value FROM EXAD.EXAD_DHUB_LKUP_DATA WHERE lkup_name = 'ir_completion_type_menu' ORDER BY ep_cr_data_dt;
