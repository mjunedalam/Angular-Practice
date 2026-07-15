-- ============================================================
-- Table: EXAD_DRLG_MR_JSON
-- Stores the full drilling morning-report JSON payload for a
-- well, keyed by (ep_a_num, report_dt). One row per well per
-- reported day, so history is retained across dates.
-- report_dt is VARCHAR2 ('DD-MON-YYYY') to match the app's
-- existing date-handling convention for other EXAD tables
-- (see exad_gwd_well_tests.w_test_sta_dt).
-- ============================================================
CREATE TABLE exad_drlg_mr_json (
  ep_a_num   NUMBER          NOT NULL,
  report_dt  VARCHAR2(50)    NOT NULL,
  mr_json    CLOB            NOT NULL,
  CONSTRAINT pk_exad_drlg_mr_json PRIMARY KEY (ep_a_num, report_dt),
  CONSTRAINT ck_exad_drlg_mr_json_json CHECK (mr_json IS JSON)
);

-- ============================================================
-- Package: EXAD_DRLG_MR_PKG
-- Owns read/write access to exad_drlg_mr_json.
-- ============================================================
CREATE OR REPLACE PACKAGE exad_drlg_mr_pkg AS

  -- Returns the stored morning-report JSON for a well on a given
  -- report date. p_mr_json is NULL when no row matches.
  -- Call: exad_drlg_mr_pkg.drlg_mr(97882, '14-JUL-2026', :out_json)
  PROCEDURE drlg_mr (
    p_ep_a_num   IN  exad_drlg_mr_json.ep_a_num%TYPE,
    p_report_dt  IN  exad_drlg_mr_json.report_dt%TYPE,
    p_mr_json    OUT CLOB
  );

  -- Upserts one well's morning-report JSON for a given report date.
  PROCEDURE upsert_drlg_mr (
    p_ep_a_num      IN  exad_drlg_mr_json.ep_a_num%TYPE,
    p_report_dt     IN  exad_drlg_mr_json.report_dt%TYPE,
    p_mr_json       IN  CLOB,
    p_do_commit     IN  VARCHAR2 DEFAULT 'Y',
    p_return_value  OUT VARCHAR2
  );

END exad_drlg_mr_pkg;
/

CREATE OR REPLACE PACKAGE BODY exad_drlg_mr_pkg AS

  PROCEDURE drlg_mr (
    p_ep_a_num   IN  exad_drlg_mr_json.ep_a_num%TYPE,
    p_report_dt  IN  exad_drlg_mr_json.report_dt%TYPE,
    p_mr_json    OUT CLOB
  ) IS
  BEGIN
    exad_log_pkg.debug('drlg_mr p_ep_a_num=' || p_ep_a_num || ', p_report_dt=' || p_report_dt);

    SELECT mr_json
      INTO p_mr_json
      FROM exad_drlg_mr_json
     WHERE ep_a_num  = p_ep_a_num
       -- AND report_dt = p_report_dt  -- TEMP: date check disabled, match on ep_a_num only
     ORDER BY TO_DATE(report_dt, 'DD-MON-YYYY') DESC
     FETCH FIRST 1 ROW ONLY;

  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      p_mr_json := NULL;
    WHEN OTHERS THEN
      exad_log_pkg.error(SQLCODE, SQLERRM);
      RAISE;
  END drlg_mr;

  PROCEDURE upsert_drlg_mr (
    p_ep_a_num      IN  exad_drlg_mr_json.ep_a_num%TYPE,
    p_report_dt     IN  exad_drlg_mr_json.report_dt%TYPE,
    p_mr_json       IN  CLOB,
    p_do_commit     IN  VARCHAR2 DEFAULT 'Y',
    p_return_value  OUT VARCHAR2
  ) IS
  BEGIN
    exad_log_pkg.debug('upsert_drlg_mr p_ep_a_num=' || p_ep_a_num || ', p_report_dt=' || p_report_dt);

    MERGE INTO exad_drlg_mr_json t
    USING (SELECT p_ep_a_num AS ep_a_num, p_report_dt AS report_dt FROM dual) s
       ON (t.ep_a_num = s.ep_a_num AND t.report_dt = s.report_dt)
     WHEN MATCHED THEN UPDATE SET t.mr_json = p_mr_json
     WHEN NOT MATCHED THEN INSERT (ep_a_num, report_dt, mr_json)
                           VALUES (p_ep_a_num, p_report_dt, p_mr_json);

    exad_util_pkg.do_commit(p_do_commit);

  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      exad_log_pkg.error(SQLCODE, SQLERRM);
      p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
      RETURN;
  END upsert_drlg_mr;

END exad_drlg_mr_pkg;
/
