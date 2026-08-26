PROCEDURE update_ir_data_prc
(
  p_ir_json       IN CLOB,
  p_app_user      IN VARCHAR2,
  p_do_commit     IN VARCHAR2 DEFAULT 'Y',
  p_return_value  OUT VARCHAR2
) IS
/********************************************************************************
  Procedure : update_ir_data_prc
  Purpose   : To manage IR data, JSON input contains all the data that need to be inserted/updated/deleted for a single IR sequence number

  Change history:
  08/19/26  Mazhar Siddiqui   Created
********************************************************************************/
  w_json CLOB;
  w_ir_seq exad_gwd_ir_header.ir_seq%TYPE;
  w_in_action VARCHAR2(30);
  w_ir_cnt NUMBER;

BEGIN

  setup(p_app_user);
  exad_log_pkg.debug('p_app_user=' || p_app_user ||
                     ' p_do_commit=' || p_do_commit ||
                     ' p_ir_json=' || p_ir_json);

  -- Check for new IR
  SELECT w_ir_seq, t.action INTO w_ir_seq, w_in_action
  FROM exad_agwa_json_data j,
       JSON_TABLE(j.ir_data,
                  '$[*]'
                  COLUMNS (table_name VARCHAR2(30) PATH '$.table',
                           NESTED PATH '$.data[*]'
                           COLUMNS (action VARCHAR2(30) PATH '$.ACTION',
                                    ir_seq NUMBER(22) PATH '$.IR_SEQ'))) t
  WHERE t.table_name = 'EXAD_GWD_IR_HEADER';

  IF w_ir_seq IS NULL AND w_in_action = 'INSERT' THEN
    SELECT exad_gwd_ir_seq.NEXTVAL INTO w_ir_seq FROM dual;
  END IF;

  -- Merge into IR Header
  MERGE INTO exad_gwd_ir_header h
  USING (SELECT t.table_name,
                t.action,
                t.ir_seq,
                t.prewap_seq,
                t.ltr_no,
                t.screen,
                t.sampling,
                t.logging,
                t.completion,
                t.gravel_pack,
                t.acidization,
                t.dev_pump_test,
                t.tops_remarks,
                t.publish_dt,
                t.publish_flg,
                t.curr_flg,
                t.publish_by,
                t.cont_geologist,
                t.sub_cont_geologist,
                t.water_remarks,
                t.gen_remarks,
                t.cmpl_type,
                t.trns_type,
                t.dt_rmks,
                t.mud_rmks,
                t.test_type,
                t.flow_rmks
         FROM exad_agwa_json_data j,
              JSON_TABLE(j.ir_data,
                         '$[*]'
                         COLUMNS (table_name VARCHAR2(30) PATH '$.table',
                                  NESTED PATH '$.data[*]'
                                  COLUMNS (action VARCHAR2(30) PATH '$.ACTION',
                                           ir_seq NUMBER(22) PATH '$.IR_SEQ',
                                           prewap_seq NUMBER(22) PATH '$.PREWAP_SEQ',
                                           ltr_no VARCHAR2(20) PATH '$.LTR_NO',
                                           screen VARCHAR2(4000) PATH '$.SCREEN',
                                           sampling VARCHAR2(4000) PATH '$.SAMPLING',
                                           logging VARCHAR2(4000) PATH '$.LOGGING',
                                           completion VARCHAR2(4000) PATH '$.COMPLETION',
                                           gravel_pack VARCHAR2(4000) PATH '$.GRAVEL_PACK',
                                           acidization VARCHAR2(4000) PATH '$.ACIDIZATION',
                                           dev_pump_test VARCHAR2(4000) PATH '$.DEV_PUMP_TEST',
                                           tops_remarks VARCHAR2(200) PATH '$.TOPS_REMARKS',
                                           publish_dt DATE PATH '$.PUBLISH_DT',
                                           publish_flg VARCHAR2(1) PATH '$.PUBLISH_FLG',
                                           curr_flg VARCHAR2(1) PATH '$.CURR_FLG',
                                           publish_by VARCHAR2(20) PATH '$.PUBLISH_BY',
                                           cont_geologist NUMBER(22) PATH '$.CONT_GEOLOGIST',
                                           sub_cont_geologist NUMBER(22) PATH '$.SUB_CONT_GEOLOGIST',
                                           water_remarks VARCHAR2(4000) PATH '$.WATER_REMARKS',
                                           gen_remarks VARCHAR2(4000) PATH '$.GEN_REMARKS',
                                           cmpl_type VARCHAR2(10) PATH '$.CMPL_TYPE',
                                           trns_type VARCHAR2(10) PATH '$.TRNS_TYPE',
                                           dt_rmks VARCHAR2(4000) PATH '$.DT_RMKS',
                                           mud_rmks VARCHAR2(4000) PATH '$.MUD_RMKS',
                                           test_type VARCHAR2(10) PATH '$.TEST_TYPE',
                                           flow_rmks VARCHAR2(4000) PATH '$.FLOW_RMKS'))) t
         WHERE t.table_name = 'EXAD_GWD_IR_HEADER'
           AND t.action IN ('INSERT', 'UPDATE')) t
  ON (h.ir_seq = t.ir_seq)
  WHEN NOT MATCHED THEN
    INSERT
    (
      h.ir_seq,
      h.prewap_seq,
      h.ltr_no,
      h.screen,
      h.sampling,
      h.logging,
      h.completion,
      h.gravel_pack,
      h.acidization,
      h.dev_pump_test,
      h.tops_remarks,
      h.publish_dt,
      h.publish_flg,
      h.curr_flg,
      h.publish_by,
      h.cont_geologist,
      h.sub_cont_geologist,
      h.water_remarks,
      h.gen_remarks,
      h.cmpl_type,
      h.trns_typf,
      h.dt_rmks,
      h.mud_rmks,
      h.test_type,
      h.flow_rmks
    )
    VALUES
    (
      w_ir_seq,
      t.prewap_seq,
      t.ltr_no,
      t.screen,
      t.sampling,
      t.logging,
      t.completion,
      t.gravel_pack,
      t.acidization,
      t.dev_pump_test,
      t.tops_remarks,
      t.publish_dt,
      t.publish_flg,
      t.curr_flg,
      t.publish_by,
      t.cont_geologist,
      t.sub_cont_geologist,
      t.water_remarks,
      t.gen_remarks,
      t.cmpl_type,
      t.trns_type,
      t.dt_rmks,
      t.mud_rmks,
      t.test_type,
      t.flow_rmks
    )
  WHEN MATCHED THEN
    UPDATE
    SET h.prewap_seq        = t.prewap_seq,
        h.ltr_no            = t.ltr_no,
        h.screen            = t.screen,
        h.sampling          = t.sampling,
        h.logging           = t.logging,
        h.completion        = t.completion,
        h.gravel_pack       = t.gravel_pack,
        h.acidization       = t.acidization,
        h.dev_pump_test     = t.dev_pump_test,
        h.tops_remarks      = t.tops_remarks,
        h.publish_dt        = t.publish_dt,
        h.publish_flg       = t.publish_flg,
        h.curr_flg          = t.curr_flg,
        h.publish_by        = t.publish_by,
        h.cont_geologist    = t.cont_geologist,
        h.sub_cont_geologist= t.sub_cont_geologist,
        h.water_remarks     = t.water_remarks,
        h.gen_remarks       = t.gen_remarks,
        h.cmpl_type         = t.cmpl_type,
        h.trns_typf         = t.trns_type,
        h.dt_rmks           = t.dt_rmks,
        h.mud_rmks          = t.mud_rmks,
        h.test_type         = t.test_type,
        h.flow_rmks         = t.flow_rmks;

  exad_util_pkg.do_commit(p_do_commit);
  p_return_value := JSON_OBJECT('status' VALUE 'SUCCESS', 'ir_seq' VALUE w_ir_seq);

EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    exad_log_pkg.error(SQLCODE, SQLERRM);
    p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
    RETURN;
END update_ir_data_prc;