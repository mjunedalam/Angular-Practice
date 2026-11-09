-- Casing table "Size" dropdown — EXAD.EXAD_DHUB_LKUP_DATA (APP_CODE = 'AGWA', LKUP_NAME = 'ir_casing_size_menu').
-- Values are bare inch sizes, the same shape csg_size is stored in. Safe to re-run: a value that already exists is skipped.
-- Menu order in the app follows EP_CR_DATA_DT, so each value gets its own second offset.
-- Change 'SYSTEM' to your user id if audit columns should show who ran it.

INSERT INTO EXAD.EXAD_DHUB_LKUP_DATA
  (app_code, lkup_name, lkup_value, ep_cr_data_cd, ep_cr_data_dt, ep_lt_dmo_cd, ep_lt_data_mod_dt)
SELECT 'AGWA', s.lkup_name, s.lkup_value, 'SYSTEM',
       TRUNC(SYSDATE) + s.seq / 86400, 'SYSTEM', TRUNC(SYSDATE) + s.seq / 86400
FROM (
  SELECT 'ir_casing_size_menu' lkup_name, '36' lkup_value, 1 seq FROM dual UNION ALL
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
  SELECT 'ir_casing_size_menu', '5', 13 FROM dual
) s
WHERE NOT EXISTS (
  SELECT 1 FROM EXAD.EXAD_DHUB_LKUP_DATA t
  WHERE t.app_code = 'AGWA' AND t.lkup_name = s.lkup_name AND t.lkup_value = s.lkup_value
);

COMMIT;

-- Check (expect 13 rows, in this order):
-- SELECT lkup_value FROM EXAD.EXAD_DHUB_LKUP_DATA
--  WHERE app_code = 'AGWA' AND lkup_name = 'ir_casing_size_menu' ORDER BY ep_cr_data_dt;
