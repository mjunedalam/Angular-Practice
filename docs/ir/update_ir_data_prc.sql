 PROCEDURE update_ir_data_prc
          (
            p_ir_json           IN CLOB,
            p_app_user          IN VARCHAR2,
            p_do_commit         IN VARCHAR2 DEFAULT 'Y',
            p_return_value      OUT VARCHAR2
          ) is
          /**********************************************************************
            Procedure : update_ir_data_prc
            Purpose   : To manage IR data. JSON input contains all the data that need to be inserted/updated/deleted for a single IR sequence number
        
            Change history:
            08/19/26  Mazhar Siddiqui      Created
          ************************************************************************ */  
            w_json CLOB := p_ir_json;
            w_ir_seq  exad_gwd_ir_header.ir_seq%type;
            w_wd_seq exad.exad_gwd_well_design.wd_seq%type;
            w_ir_action VARCHAR2(30);
            w_ir_cnt number;
            w_tot_merged number;
        
          BEGIN
        
            p_return_value:= 'SUCCESS';
            setup(p_app_user);
            exad_log_pkg.debug( '  p_app_user=' || p_app_user ||
                                ', p_do_commit=' || p_do_commit ||
                                ', p_ir_json='||p_ir_json);     
        
        -- Check for new IR
        SELECT t.ir_seq, t.action into w_ir_seq, w_ir_action
          FROM /*exad_agwa_json_data j,*/
               json_table(w_json,
                          '$[*]'
                          COLUMNS(table_name VARCHAR2(30) PATH '$.table',
                                  NESTED PATH '$.data[*]'
                                  COLUMNS(action VARCHAR2(30) PATH '$.action',
                                          ir_seq NUMBER(22) PATH '$.ir_seq'))) t
         WHERE upper(t.table_name) = 'EXAD_GWD_IR_HEADER' ;
        
        if w_ir_seq is null and w_ir_action = 'INSERT' then
      --    w_ir_seq := null;  -- This is new IR - Get the new sequence number
          SELECT exad_gwd_sq01.nextval INTO w_ir_seq FROM dual;
          p_return_value:= w_ir_seq;
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
          FROM /*exad_agwa_json_data j,*/
               json_table(w_json,
                          '$[*]'
                          columns(table_name varchar2(30) path '$.table',
                                  nested path '$.data[*]'
                                  columns(action varchar2(30) path '$.action',
                                          ir_seq number(22) path '$.ir_seq',
                                          prewap_seq number(22) path '$.prewap_seq',
                                          ltr_no varchar2(20) path '$.ltr_no',
                                          screen varchar2(4000) path '$.screen',
                                          sampling varchar2(4000) path '$.sampling',
                                          logging varchar2(4000) path '$.logging',
                                          completion varchar2(4000) path
                                          '$.completion',
                                          gravel_pack varchar2(4000) path
                                          '$.gravel_pack',
                                          acidization varchar2(4000) path
                                          '$.acidization',
                                          dev_pump_test varchar2(4000) path
                                          '$.dev_pump_test',
                                          tops_remarks varchar2(200) path
                                          '$.tops_remarks',
                                          publish_dt date path '$.publish_dt',
                                          publish_flg varchar2(1) path '$.publish_flg',
                                          curr_flg varchar2(1) path '$.curr_flg',
                                          publish_by varchar2(20) path '$.publish_by',
                                          cont_geologist number(22) path
                                          '$.cont_geologist',
                                          sub_cont_geologist number(22) path
                                          '$.sub_cont_geologist',
                                          water_remarks varchar2(4000) path
                                          '$.water_remarks',
                                          gen_remarks varchar2(4000) path
                                          '$.gen_remarks',
                                          cmpl_type varchar2(10) path '$.cmpl_type',
                                          trns_type varchar2(10) path '$.trns_type',
                                          dt_rmks varchar2(4000) path '$.dt_rmks',
                                          mud_rmks varchar2(4000) path '$.mud_rmks',
                                          test_type varchar2(10) path '$.test_type',
                                          flow_rmks varchar2(4000) path '$.flow_rmks'))) t
         WHERE upper(t.table_name) = 'EXAD_GWD_IR_HEADER' and upper(t.action) in ('INSERT','UPDATE')) t
            ON (h.ir_seq = w_ir_seq)
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
                    h.flow_rmks=t.flow_rmks ;
                    
             w_tot_merged := SQL%ROWCOUNT;        
        
      
        -- Merge & delete  - IR Casing data
         MERGE INTO exad_gwd_ir_casing h
         USING (SELECT t.table_name,
                       t.action,
                       t.ir_seq,
                       t.csg_size,
                       t.csg_type,
                       t.csg_depth,
                       t.csg_remarks
                  FROM /*exad_agwa_json_data j,*/
                       json_table(w_json,
                                  '$[*]'
                                  columns(table_name VARCHAR2(30) path '$.table',
                                          NESTED path '$.data[*]'
                                          columns(action VARCHAR2(30) path
                                                  '$.action',
                                                  ir_seq NUMBER(22) path '$.ir_seq',
                                                  csg_size VARCHAR2(20) PATH
                                                  '$.csg_size',
                                                  csg_type VARCHAR2(50) PATH
                                                  '$.csg_type',
                                                  csg_depth NUMBER(22) PATH
                                                  '$.csg_depth',
                                                  csg_remarks VARCHAR2(200) PATH
                                                  '$.csg_remarks'))) t
                 WHERE upper(t.table_name) = 'EXAD_GWD_IR_CASING'
                   AND upper(t.action) IN ('INSERT', 'UPDATE')) t
         ON (h.ir_seq = w_ir_seq and h.csg_size = t.csg_size)
         WHEN NOT MATCHED THEN
           INSERT
             (h.ir_seq, h.csg_size, h.csg_type, h.csg_depth, h.csg_remarks)
           VALUES
             (w_ir_seq, t.csg_size, t.csg_type, t.csg_depth, t.csg_remarks)
         WHEN MATCHED THEN
           UPDATE
              SET /*h.csg_size    = t.csg_size,*/
                  h.csg_type    = t.csg_type,
                  h.csg_depth   = t.csg_depth,
                  h.csg_remarks = t.csg_remarks;
                    
       delete exad_gwd_ir_casing a
       where (a.ir_seq, a.csg_size) in (SELECT t.ir_seq, t.csg_size  
          FROM json_table(w_json,
                          '$[*]'
                          COLUMNS(table_name VARCHAR2(30) PATH '$.table',
                                  NESTED PATH '$.data[*]'
                                  COLUMNS(action VARCHAR2(30) path '$.action',
                                           ir_seq NUMBER(22) path '$.ir_seq',
                                           csg_size VARCHAR2(20) PATH
                                                  '$.csg_size'))) t
         WHERE upper(t.table_name) = 'EXAD_GWD_IR_CASING' and upper(t.action) = 'DELETE');
         
         -- Merge & delete  - Hydrogeology
         MERGE INTO exad_gwd_ir_hydrogeology h
         USING (SELECT t.table_name,
           t.action,
           t.ir_seq,
           t.st_long_cd,
           t.est_sta_water_lvl,
           t.est_water_quality,
           t.est_productivity,
           t.flowing,
           t.siwhp,
           t.h2s
                  FROM /*exad_agwa_json_data j,*/
                       json_table(w_json,
                                  '$[*]'
                                  columns(table_name VARCHAR2(30) path '$.table',
                                          NESTED path '$.data[*]'
                                          columns(action VARCHAR2(30) PATH '$.action',
                                      ir_seq NUMBER(22) PATH '$.ir_seq',
                                      st_long_cd VARCHAR2(10) PATH '$.st_long_cd',
                                      est_sta_water_lvl NUMBER PATH '$.est_sta_water_lvl',
                                      est_water_quality NUMBER PATH '$.est_water_quality',
                                      est_productivity NUMBER PATH  '$.est_productivity',
                                      flowing VARCHAR2(1) PATH '$.flowing',
                                      siwhp NUMBER PATH '$.siwhp',
                                      h2s VARCHAR2(2000) PATH '$.h2s'))) t
                 WHERE upper(t.table_name) = 'EXAD_GWD_IR_HYDROGEOLOGY'
                   AND upper(t.action) IN ('INSERT', 'UPDATE')) t
         ON (h.ir_seq = w_ir_seq and h.st_long_cd = t.st_long_cd)
         WHEN NOT MATCHED THEN
           INSERT
             (h.ir_seq, h.st_long_cd, h.est_sta_water_lvl, h.est_water_quality, h.est_productivity, h.flowing, h.siwhp, h.h2s)
           VALUES
             (w_ir_seq, t.st_long_cd, t.est_sta_water_lvl, t.est_water_quality, t.est_productivity, t.flowing, t.siwhp, t.h2s)
         WHEN MATCHED THEN
           UPDATE
           SET h.est_sta_water_lvl = t.est_sta_water_lvl,
              h.est_water_quality = t.est_water_quality,
              h.est_productivity = t.est_productivity,
              h.flowing = t.flowing,
              h.siwhp = t.siwhp,
              h.h2s = t.h2s;
    
       -- Delete existing records             
       DELETE exad_gwd_ir_hydrogeology a
        WHERE (a.ir_seq, a.st_long_cd) IN
              (SELECT t.ir_seq, t.st_long_cd
                 FROM json_table(w_json,
                                 '$[*]'
                                 COLUMNS(table_name VARCHAR2(30) PATH '$.table',
                                         NESTED PATH '$.data[*]'
                                         COLUMNS(action VARCHAR2(30) path '$.action',
                                                 ir_seq NUMBER(22) path '$.ir_seq',
                                                 st_long_cd VARCHAR2(10) PATH '$.st_long_cd'))) t
                WHERE upper(t.table_name) = 'EXAD_GWD_IR_HYDROGEOLOGY'
                  AND upper(t.action) = 'DELETE');
         
    
         -- Merge & delete  - Tops
         MERGE INTO exad_gwd_ir_tops h
         USING (SELECT t.table_name,
           t.action,
           t.ir_seq,
           t.st_long_cd,
           t.plan_tvd_dpth,
           t.plan_ss_dpth
                  FROM /*exad_agwa_json_data j,*/
                       json_table(w_json,
                                  '$[*]'
                                  columns(table_name VARCHAR2(30) path '$.table',
                                          NESTED path '$.data[*]'
                                          columns(action VARCHAR2(30) PATH '$.action',
                                      ir_seq NUMBER(22) PATH '$.ir_seq',
                                      st_long_cd VARCHAR2(10) PATH '$.st_long_cd',
                                      plan_tvd_dpth NUMBER(22) PATH  '$.plan_tvd_dpth',
                                      plan_ss_dpth NUMBER(22) PATH  '$.plan_ss_dpth'))) t
                 WHERE upper(t.table_name) = 'EXAD_GWD_IR_TOPS'
                   AND upper(t.action) IN ('INSERT', 'UPDATE')) t
         ON (h.ir_seq = w_ir_seq and h.st_long_cd = t.st_long_cd)
         WHEN NOT MATCHED THEN
           INSERT
             (h.ir_seq, h.st_long_cd, h.plan_tvd_dpth,h.plan_ss_dpth)
           VALUES
             (w_ir_seq, t.st_long_cd, t.plan_tvd_dpth,t.plan_ss_dpth)
         WHEN MATCHED THEN
           UPDATE 
           SET h.plan_tvd_dpth = t.plan_tvd_dpth,
               h.plan_ss_dpth = t.plan_ss_dpth;
    
       -- Delete existing records             
       DELETE exad_gwd_ir_tops a
        WHERE (a.ir_seq, a.st_long_cd) IN
              (SELECT t.ir_seq, t.st_long_cd
                 FROM json_table(w_json,
                                 '$[*]'
                                 COLUMNS(table_name VARCHAR2(30) PATH '$.table',
                                         NESTED PATH '$.data[*]'
                                         COLUMNS(action VARCHAR2(30) path '$.action',
                                                 ir_seq NUMBER(22) path '$.ir_seq',
                                                 st_long_cd VARCHAR2(10) PATH '$.st_long_cd'))) t
                WHERE upper(t.table_name) = 'EXAD_GWD_IR_TOPS'
                  AND upper(t.action) = 'DELETE');
    
        -- Merge & delete  - Tops
         MERGE INTO exad_gwd_ir_water h
         USING (SELECT t.table_name,
          t.action,
          t.ir_seq,
          t.ep_a_num,
          t.distanct,
          t.direction,
          t.aquifer,
          t.td,
          t.rate,
          t.rpm,
          t.swl,
          t.final_pwl,
          t.drawdown,
          t.spec_capacity,
          t.temp,
          t.field_tds,
          t.test_duration,
          t.h2s,
          t.sediments_per,
          t.wb_name,
          t.siwhp
                  FROM /*exad_agwa_json_data j,*/
                       json_table(w_json,
                                  '$[*]'
                                  columns(table_name VARCHAR2(30) path '$.table',
                                          NESTED path '$.data[*]'
                                          columns(action VARCHAR2(30) PATH '$.action',
                                      ir_seq NUMBER(22) PATH  '$.ir_seq',
                                      ep_a_num NUMBER(22) PATH  '$.ep_a_num',
                                      distanct NUMBER(22) PATH  '$.distanct',
                                      direction VARCHAR2(10) PATH  '$.direction',
                                      aquifer VARCHAR2(10) PATH  '$.aquifer',
                                      td NUMBER(22) PATH  '$.td',
                                      rate NUMBER(22) PATH  '$.rate',
                                      rpm NUMBER(22) PATH  '$.rpm',
                                      swl NUMBER(22) PATH  '$.swl',
                                      final_pwl NUMBER(22) PATH  '$.final_pwl',
                                      drawdown NUMBER(22) PATH  '$.drawdown',
                                      spec_capacity NUMBER(22) PATH  '$.spec_capacity',
                                      temp NUMBER(22) PATH  '$.temp',
                                      field_tds NUMBER(22) PATH  '$.field_tds',
                                      test_duration NUMBER(22) PATH  '$.test_duration',
                                      h2s NUMBER(22) PATH  '$.h2s',
                                      sediments_per NUMBER(22) PATH  '$.sediments_per',
                                      wb_name VARCHAR2(20) PATH  '$.wb_name',
                                      siwhp NUMBER(22) PATH  '$.siwhp'))) t
                 WHERE upper(t.table_name) = 'EXAD_GWD_IR_WATER'
                   AND upper(t.action) IN ('INSERT', 'UPDATE')) t
         ON (h.ir_seq = w_ir_seq and h.ep_a_num = t.ep_a_num)
         WHEN NOT MATCHED THEN
           INSERT
             (h.ir_seq, h.ep_a_num,
              h.distanct,
              h.direction,
              h.aquifer,
              h.td,
              h.rate,
              h.rpm,
              h.swl,
              h.final_pwl,
              h.drawdown,
              h.spec_capacity,
              h.temp,
              h.field_tds,
              h.test_duration,
              h.h2s,
              h.sediments_per,
              h.wb_name,
              h.siwhp)
           VALUES
             (w_ir_seq, t.ep_a_num,
              t.distanct,
              t.direction,
              t.aquifer,
              t.td,
              t.rate,
              t.rpm,
              t.swl,
              t.final_pwl,
              t.drawdown,
              t.spec_capacity,
              t.temp,
              t.field_tds,
              t.test_duration,
              t.h2s,
              t.sediments_per,
              t.wb_name,
              t.siwhp)
         WHEN MATCHED THEN
           UPDATE 
           SET h.distanct = t.distanct,
              h.direction = t.direction,
              h.aquifer = t.aquifer,
              h.td = t.td,
              h.rate = t.rate,
              h.rpm = t.rpm,
              h.swl = t.swl,
              h.final_pwl = t.final_pwl,
              h.drawdown = t.drawdown,
              h.spec_capacity = t.spec_capacity,
              h.temp = t.temp,
              h.field_tds = t.field_tds,
              h.test_duration = t.test_duration,
              h.h2s = t.h2s,
              h.sediments_per = t.sediments_per,
              h.wb_name = t.wb_name,
              h.siwhp = t.siwhp;
    
       -- Delete existing records             
       DELETE exad_gwd_ir_water a
        WHERE (a.ir_seq, a.ep_a_num) IN
              (SELECT t.ir_seq, t.ep_a_num
                 FROM json_table(w_json,
                                 '$[*]'
                                 COLUMNS(table_name VARCHAR2(30) PATH '$.table',
                                         NESTED PATH '$.data[*]'
                                         COLUMNS(action VARCHAR2(30) path '$.action',
                                                 ir_seq NUMBER(22) path '$.ir_seq',
                                                 ep_a_num NUMBER(22) PATH  '$.ep_a_num'))) t
                WHERE upper(t.table_name) = 'EXAD_GWD_IR_WATER'
                  AND upper(t.action) = 'DELETE');
                  
             exad_util_pkg.do_commit(p_do_commit);
       
  
       -- Merge & delete  - Well Design
        -- Check for new Well Design
        SELECT MAX(t.wd_seq), MAX(t.action) into w_wd_seq, w_ir_action
          FROM  json_table(w_json,
                          '$[*]'
                          COLUMNS(table_name VARCHAR2(30) PATH '$.table',
                                  NESTED PATH '$.data[*]'
                                  COLUMNS(action VARCHAR2(30) PATH '$.action',
                                          wd_seq NUMBER(22) PATH  '$.wd_seq'))) t
         WHERE upper(t.table_name) = 'EXAD_GWD_WELL_DESIGN' ;
        
        if w_wd_seq is null and w_ir_action = 'INSERT' then
          SELECT exad_gwd_sq01.nextval INTO w_wd_seq FROM dual;
        end if; 
        
  
         MERGE INTO exad_gwd_well_design h
         USING (SELECT t.table_name,
          t.action,
          t.wd_seq,
          t.prewap_seq,
          t.sta_water_lvl,
          t.sw_lvl_txt,
          t.tds,
          t.completion_type,
          t.w_prim_hid,
          t.w_num,
          t.pump_lvl,
          t.pump_lvl_txt,
          t.notes,
          t.publish_dt,
          t.publish_flg,
          t.curr_flg,
          t.publish_by,
          t.oh_flg,
          t.oh_remarks,
          t.gp_flg,
          t.gp_remarks,
          t.perforated_flg,
          t.perforated_remarks,
          t.ls_flg,
          t.ls_remarks,
          t.status,
          t.design_phase,
          t.design_rpt
   FROM /*exad_agwa_json_data j,*/
                       json_table(w_json,
                                  '$[*]'
                                  columns(table_name VARCHAR2(30) path '$.table',
                                          NESTED path '$.data[*]'
                                          columns(action VARCHAR2(30) PATH '$.action',
                                      wd_seq NUMBER(22) PATH  '$.wd_seq',
                                      prewap_seq NUMBER(22) PATH  '$.prewap_seq',
                                      sta_water_lvl NUMBER(22) PATH  '$.sta_water_lvl',
                                      sw_lvl_txt VARCHAR2(100) PATH  '$.sw_lvl_txt',
                                      tds NUMBER(22) PATH  '$.tds',
                                      completion_type VARCHAR2(20) PATH  '$.completion_type',
                                      w_prim_hid VARCHAR2(4) PATH  '$.w_prim_hid',
                                      w_num NUMBER(22) PATH  '$.w_num',
                                      pump_lvl NUMBER(22) PATH  '$.pump_lvl',
                                      pump_lvl_txt VARCHAR2(100) PATH  '$.pump_lvl_txt',
                                      notes VARCHAR2(200) PATH  '$.notes',
                                      publish_dt DATE PATH  '$.publish_dt',
                                      publish_flg VARCHAR2(1) PATH  '$.publish_flg',
                                      curr_flg VARCHAR2(1) PATH  '$.curr_flg',
                                      publish_by VARCHAR2(30) PATH  '$.publish_by',
                                      oh_flg VARCHAR2(1) PATH  '$.oh_flg',
                                      oh_remarks VARCHAR2(200) PATH  '$.oh_remarks',
                                      gp_flg VARCHAR2(1) PATH  '$.gp_flg',
                                      gp_remarks VARCHAR2(200) PATH  '$.gp_remarks',
                                      perforated_flg VARCHAR2(1) PATH  '$.perforated_flg',
                                      perforated_remarks VARCHAR2(200) PATH  '$.perforated_remarks',
                                      ls_flg VARCHAR2(1) PATH  '$.ls_flg',
                                      ls_remarks VARCHAR2(200) PATH  '$.ls_remarks',
                                      status VARCHAR2(20) PATH  '$.status',
                                      design_phase VARCHAR2(20) PATH  '$.design_phase',
                                      design_rpt BLOB FORMAT JSON PATH  '$.design_rpt' ))) t
                 WHERE upper(t.table_name) = 'EXAD_GWD_WELL_DESIGN'
                   AND upper(t.action) IN ('INSERT', 'UPDATE')) t
         ON (h.wd_seq = w_wd_seq )
         WHEN NOT MATCHED THEN
           INSERT
             (h.wd_seq,
              h.prewap_seq,
              h.sta_water_lvl,
              h.sw_lvl_txt,
              h.tds,
              h.completion_type,
              h.w_prim_hid,
              h.w_num,
              h.pump_lvl,
              h.pump_lvl_txt,
              h.notes,
              h.publish_dt,
              h.publish_flg,
              h.curr_flg,
              h.publish_by,
              h.oh_flg,
              h.oh_remarks,
              h.gp_flg,
              h.gp_remarks,
              h.perforated_flg,
              h.perforated_remarks,
              h.ls_flg,
              h.ls_remarks,
              h.status,
              h.design_phase,
              h.design_rpt)
           VALUES
             (w_wd_seq,
              t.prewap_seq,
              t.sta_water_lvl,
              t.sw_lvl_txt,
              t.tds,
              t.completion_type,
              t.w_prim_hid,
              t.w_num,
              t.pump_lvl,
              t.pump_lvl_txt,
              t.notes,
              t.publish_dt,
              t.publish_flg,
              t.curr_flg,
              t.publish_by,
              t.oh_flg,
              t.oh_remarks,
              t.gp_flg,
              t.gp_remarks,
              t.perforated_flg,
              t.perforated_remarks,
              t.ls_flg,
              t.ls_remarks,
              t.status,
              t.design_phase,
              t.design_rpt)
         WHEN MATCHED THEN
           UPDATE 
           SET  h.prewap_seq = t.prewap_seq,
                h.sta_water_lvl = t.sta_water_lvl,
                h.sw_lvl_txt = t.sw_lvl_txt,
                h.tds = t.tds,
                h.completion_type = t.completion_type,
                h.w_prim_hid = t.w_prim_hid,
                h.w_num = t.w_num,
                h.pump_lvl = t.pump_lvl,
                h.pump_lvl_txt = t.pump_lvl_txt,
                h.notes = t.notes,
                h.publish_dt = t.publish_dt,
                h.publish_flg = t.publish_flg,
                h.curr_flg = t.curr_flg,
                h.publish_by = t.publish_by,
                h.oh_flg = t.oh_flg,
                h.oh_remarks = t.oh_remarks,
                h.gp_flg = t.gp_flg,
                h.gp_remarks = t.gp_remarks,
                h.perforated_flg = t.perforated_flg,
                h.perforated_remarks = t.perforated_remarks,
                h.ls_flg = t.ls_flg,
                h.ls_remarks = t.ls_remarks,
                h.status = t.status,
                h.design_phase = t.design_phase,
                h.design_rpt = t.design_rpt;
    
       -- Delete existing records             
       DELETE exad_gwd_well_design a
        WHERE  a.wd_seq  IN
              (SELECT t.wd_seq
                 FROM json_table(w_json,
                                 '$[*]'
                                 COLUMNS(table_name VARCHAR2(30) PATH '$.table',
                                         NESTED PATH '$.data[*]'
                                         COLUMNS(action VARCHAR2(30) path '$.action',
                                                 wd_seq NUMBER(22) path '$.wd_seq'))) t
                WHERE upper(t.table_name) = 'EXAD_GWD_WELL_DESIGN'
                  AND upper(t.action) = 'DELETE');
                  
             exad_util_pkg.do_commit(p_do_commit);
       
            exad_log_pkg.debug( '  p_app_user=' || p_app_user ||
                                ', p_do_commit=' || p_do_commit ||
                                ', w_ir_seq='||w_ir_seq||
                                ', w_tot_merged='||w_tot_merged);   
                                
        EXCEPTION
            WHEN OTHERS THEN
              ROLLBACK;
              exad_log_pkg.error(SQLCODE, SQLERRM);
              p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
              RETURN;
        end update_ir_data_prc;   