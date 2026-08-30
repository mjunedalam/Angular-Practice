Procedure update_ir_data_prc
(
    p_ir_json       IN CLOB,
    p_app_user      IN VARCHAR2,
    p_do_commit     IN VARCHAR2 DEFAULT 'Y',
    p_return_value  OUT VARCHAR2
) is
/********************************************************************************
Procedure : update_ir_data_prc
Purpose   : To manage IR data. JSON input contains all the data that need to be inserted/updated/deleted for a single IR sequence number

Change history:
08/19/26  Nazhar Siddiqui    Created
********************************************************************************/
w_json CLOB;
w_ir_seq exad_gwd_ir_header.ir_seq%type;
w_ir_action VARCHAR2(30);
w_ir_cnt number;

BEGIN

p_return_value := 'SUCCESS';
setup(p_app_user);
exad_log_pkg.debug('  p_app_user=' || p_app_user ||
                   ' , p_do_commit=' || p_do_commit ||
                   ' , p_ir_json=' || p_ir_json);

-- Check for new IR
SELECT w_ir_seq, w_action into w_ir_seq, w_ir_action
FROM exad_agwa_json_data j,
     json_table(j.ir_data,
                '$[*]'
                COLUMNS(table_name VARCHAR2(30) PATH '$.table',
                        NESTED PATH '$.data[*]'
                        COLUMNS(action VARCHAR2(30) PATH '$.ACTION',
                                IR_SEQ NUMBER(22) PATH '$.IR_SEQ'))) t
WHERE t.table_name = 'EXAD_GWD_IR_HEADER' ;

if w_ir_seq is null and w_ir_action = 'INSERT' then
   w_ir_seq := null;   -- This is new IR - Get the new sequence number
   SELECT EXAD_GWD_SEQ01.nextval INTO w_ir_seq FROM dual;
   p_return_value := w_ir_seq;
end if;

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
            json_table(j.ir_data,
                       '$[*]'
                       COLUMNS(table_name VARCHAR2(30) PATH '$.table',
                               NESTED PATH '$.data[*]'
                               COLUMNS(action VARCHAR2(30) PATH '$.ACTION',
                                       IR_SEQ NUMBER(22) PATH '$.IR_SEQ',
                                       PREWAP_SEQ NUMBER(22) PATH '$.PREWAP_SEQ',
                                       LTR_NO VARCHAR2(20) PATH '$.LTR_NO',
                                       SCREEN VARCHAR2(4000) PATH '$.SCREEN',
                                       SAMPLING VARCHAR2(4000) PATH '$.SAMPLING',
                                       LOGGING VARCHAR2(4000) PATH '$.LOGGING',
                                       COMPLETION VARCHAR2(4000) PATH '$.COMPLETION',
                                       GRAVEL_PACK VARCHAR2(4000) PATH '$.GRAVEL_PACK',
                                       ACIDIZATION VARCHAR2(4000) PATH '$.ACIDIZATION',
                                       DEV_PUMP_TEST VARCHAR2(4000) PATH '$.DEV_PUMP_TEST',
                                       TOPS_REMARKS VARCHAR2(200) PATH '$.TOPS_REMARKS',
                                       PUBLISH_DT DATE PATH '$.PUBLISH_DT',
                                       PUBLISH_FLG VARCHAR2(1) PATH '$.PUBLISH_FLG',
                                       CURR_FLG VARCHAR2(1) PATH '$.CURR_FLG',
                                       PUBLISH_BY VARCHAR2(20) PATH '$.PUBLISH_BY',
                                       CONT_GEOLOGIST NUMBER(22) PATH '$.CONT_GEOLOGIST',
                                       SUB_CONT_GEOLOGIST NUMBER(22) PATH '$.SUB_CONT_GEOLOGIST',
                                       WATER_REMARKS VARCHAR2(4000) PATH '$.WATER_REMARKS',
                                       GEN_REMARKS VARCHAR2(4000) PATH '$.GEN_REMARKS',
                                       CMPL_TYPE VARCHAR2(10) PATH '$.CMPL_TYPE',
                                       TRNS_TYPE VARCHAR2(10) PATH '$.TRNS_TYPE',
                                       DT_RMKS VARCHAR2(4000) PATH '$.DT_RMKS',
                                       MUD_RMKS VARCHAR2(4000) PATH '$.MUD_RMKS',
                                       TEST_TYPE VARCHAR2(10) PATH '$.TEST_TYPE',
                                       FLOW_RMKS VARCHAR2(4000) PATH '$.FLOW_RMKS'))) t
WHERE t.table_name = 'EXAD_GWD_IR_HEADER' and t.action in ('INSERT','UPDATE')) t
ON (h.ir_seq = t.ir_seq)
WHEN NOT MATCHED THEN
  INSERT
    (h.ir_seq,
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
     h.trns_type,
     h.dt_rmks,
     h.mud_rmks,
     h.test_type,
     h.flow_rmks)
  VALUES
    (w_ir_seq,
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
     t.flow_rmks)
WHEN MATCHED THEN
  UPDATE
    SET h.prewap_seq=t.prewap_seq,
        h.ltr_no=t.ltr_no,
        h.screen=t.screen,
        h.sampling=t.sampling,
        h.logging=t.logging,
        h.completion=t.completion,
        h.gravel_pack=t.gravel_pack,
        h.acidization=t.acidization,
        h.dev_pump_test=t.dev_pump_test,
        h.tops_remarks=t.tops_remarks,
        h.publish_dt=t.publish_dt,
        h.publish_flg=t.publish_flg,
        h.curr_flg=t.curr_flg,
        h.publish_by=t.publish_by,
        h.cont_geologist=t.cont_geologist,
        h.sub_cont_geologist=t.sub_cont_geologist,
        h.water_remarks=t.water_remarks,
        h.gen_remarks=t.gen_remarks,
        h.cmpl_type=t.cmpl_type,
        h.trns_type=t.trns_type,
        h.dt_rmks=t.dt_rmks,
        h.mud_rmks=t.mud_rmks,
        h.test_type=t.test_type,
        h.flow_rmks=t.flow_rmks;

exad_util_pkg.do_commit(p_do_commit);

EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    exad_log_pkg.error(SQLCODE, SQLERRM);
    p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
    RETURN;
end update_ir_data_prc;

-- Normal End

END exad_agwa_iud_pkg;