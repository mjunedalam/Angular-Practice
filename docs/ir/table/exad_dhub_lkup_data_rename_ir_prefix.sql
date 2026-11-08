-- SUPERSEDED: run exad_dhub_lkup_data_final.sql instead (it covers this script and everything added since).
-- One-off migration for a table already seeded with the un-prefixed names (completion_menu, ...):
-- renames them to the ir_-prefixed names the IR module now reads (ir_completion_menu, ...).
-- Run this INSTEAD of the insert script when rows already exist. Safe to re-run.
UPDATE EXAD.EXAD_DHUB_LKUP_DATA
SET LKUP_NAME = 'ir_' || LKUP_NAME,
    EP_LT_DMO_CD = 'SYSTEM',
    EP_LT_DATA_MOD_DT = SYSDATE
WHERE APP_CODE = 'AGWA'
  AND LKUP_NAME IN ('completion_menu', 'acidization_menu', 'transmission_menu', 'logging_menu',
                    'mud_logging_menu', 'sampling_menu', 'flow_test_menu', 'dev_testing_menu');

COMMIT;
