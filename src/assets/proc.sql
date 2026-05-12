 PROCEDURE drlg_mr_single
  (
   p_json_in  IN OUT CLOB,
   p_json_out OUT CLOB
  )
  IS
      
    message  VARCHAR2(4000);  

    p_json1 CLOB;
    p_json2 CLOB;
    p_json3 CLOB;
--    p_json4 CLOB;
    p_json_ref CLOB;
    

    l_ep_a_num  NUMBER;
    l_dt  DATE;



    CURSOR rac_crs IS 
    SELECT d.rac_num
      FROM drlg_op_status d
      LEFT JOIN rig_activity r ON r.rac_num = d.rac_num
     WHERE TRUNC(d.w_act_dt) = l_dt
       AND d.ep_a_num = l_ep_a_num
     ORDER BY 1 DESC;  
     
     rac_rec  rac_crs%ROWTYPE;
    
    CURSOR ir_seq_crs IS
    SELECT h.ir_seq, p.prewap_seq, w.ep_a_num
      FROM exad_gwd_ir_header h
      JOIN exad_rcd_prewap p ON p.prewap_seq = h.prewap_seq
      JOIN well_master w ON p.w_prim_hid = w.w_prim_hid AND p.w_num = TO_CHAR(w.w_num)
     WHERE w.ep_a_num = l_ep_a_num 
     ORDER BY h.ir_seq DESC;
       
    ir_seq_rec  ir_seq_crs%ROWTYPE;

    $if NOT(exad_db_constants_pkg.is_devl) $then      

   
    CURSOR gwd_ir_header_crs IS
    SELECT JSON_ARRAYAGG(
            JSON_OBJECT('dtRemarks' VALUE dt_rmks,
                        'mudRemarks'   VALUE mud_rmks,
                        'loggingRemarks' VALUE logging_rmks
                    )
                ) AS gwd_ir_header_json
                FROM (SELECT TRIM(regexp_replace(h.dt_rmks, '<.*?>')) dt_rmks
                      ,TRIM(regexp_replace(h.mud_rmks, '<.*?>')) mud_rmks
                      ,TRIM(regexp_replace(h.logging, '<.*?>')) logging_rmks
                  FROM exad_gwd_ir_header h
                WHERE ir_seq = ir_seq_rec.ir_seq);
                
    gwd_ir_header_rec  gwd_ir_header_crs%ROWTYPE;    
    
    CURSOR tops_crs IS     
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'stLongCd' VALUE st_long_cd,
            'planTvdDepth'   VALUE plan_tvd_dpth,
            'planSsDepth' VALUE plan_ss_dpth
        ) ORDER BY t.plan_tvd_dpth
    ) AS gwd_ir_tops_json
    FROM exad_gwd_ir_tops t
    WHERE t.ir_seq = ir_seq_rec.ir_seq;         
    
    tops_rec tops_crs%ROWTYPE;
    
    
    CURSOR csg_crs IS
    SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
              'csgSize' VALUE c.csg_size,
              'csgType' VALUE c.csg_type,
              'csgDepth' VALUE c.csg_depth,
              'csgRemarks' VALUE c.csg_remarks          
           )  ORDER BY c.csg_depth
        ) AS gwd_ir_casing   
      FROM exad_gwd_ir_casing c
     WHERE c.ir_seq  = ir_seq_rec.ir_seq;         
     
     csg_rec  csg_crs%ROWTYPE; 

     
    CURSOR hydrogeology_crs IS     
    SELECT JSON_ARRAYAGG(
             JSON_OBJECT(
               'flowType' VALUE h.flowing,
               'estTargetAquifier' VALUE h.st_long_cd,
               'estStaticWaterLevel' VALUE h.est_sta_water_lvl,
               'estWaterQuality' VALUE h.est_water_quality,
               'estProductivity' VALUE h.est_productivity,
               'estH2s' VALUE h.h2s
          )  ORDER BY h.st_long_cd
       ) AS gwd_ir_hydrogeology       
     FROM exad_gwd_ir_hydrogeology h 
    WHERE h.ir_seq = ir_seq_rec.ir_seq;
    
    hydrogeology_rec  hydrogeology_crs%ROWTYPE; 

    CURSOR water_crs IS     
    SELECT JSON_ARRAYAGG(
             JSON_OBJECT(    
              'offsetWaterWell' VALUE w.wb_name,
              'distance' VALUE w.distanct,
              'direction' VALUE w.direction,
              'aquifer' VALUE w.aquifer,
              'td' VALUE w.td,
              'flowRate' VALUE w.rate,
              'rpm' VALUE w.rpm,
              'staticWaterLevel' VALUE w.swl,
              'specificCapacity' VALUE w.spec_capacity,
              'drawDown' VALUE w.drawdown,
              'fieldTds' VALUE w.field_tds,
              'h2s' VALUE w.h2s,
              'testDuration' VALUE w.test_duration
          )  ORDER BY w.aquifer
       ) AS gwd_ir_water
       FROM exad_gwd_ir_water w
       WHERE w.ir_seq = ir_seq_rec.ir_seq;

    water_rec  water_crs%ROWTYPE; 

    CURSOR prewap_crs IS     
    SELECT JSON_ARRAYAGG(
             JSON_OBJECT(    
                'surfaceElevation' VALUE p.sv_surf_elevf,
                'estTargetDepth' VALUE p.target_dpth,
                'targetFormation' VALUE p.target_form,
                'supportedBusiness' VALUE p.expl_wb_name
          ) 
       ) AS exad_rcd_prewap
       FROM exad_rcd_prewap p
       WHERE p.prewap_seq = ir_seq_rec.prewap_seq;    
       

    prewap_rec  prewap_crs%ROWTYPE; 
    
   CURSOR mud_circ_crs IS
    SELECT JSON_ARRAYAGG(
             JSON_OBJECT(    
               'wPrsntDpth' VALUE d.w_prsnt_dpth,
               'wMudCircPc' VALUE d.w_mud_circ_pc,
               'wDpthChgDis' VALUE d.w_dpth_chg_dis
          ) ORDER BY d.w_prsnt_dpth     
      ) AS mud_circ
     FROM drlg_op_status d 
    WHERE d.ep_a_num = l_ep_a_num
      AND d.w_prsnt_dpth > 0
      AND d.w_dpth_chg_dis > 0
      AND d.w_mud_circ_pc IS NOT NULL;

    mud_circ_rec  mud_circ_crs%ROWTYPE; 
   
   $end

    CURSOR well_test_crs IS
    SELECT JSON_ARRAYAGG(
             JSON_OBJECT(  
               'egwt_id' VALUE wt.egwt_id, 
               'rsvrCd' VALUE wt.rsvr_cd,
               'hydTestTypCd' VALUE wt.w_hyd_test_typ_cd,
               'testStaDt' VALUE wt.w_test_sta_dt,
               'temp' VALUE wt.w_temp,
               'hydH2sCnc' VALUE wt.w_hyd_h2s_cnc,
               'wtrSaTdsCnc' VALUE wt.w_wtr_sa_tds_cnc,
               'rpm' VALUE wt.w_rpm,
               'siwhp' VALUE wt.siwhp,
               'hydPmpDpth' VALUE wt.w_hyd_pmp_dpth,
               'hydProdRt' VALUE wt.w_hyd_prod_rt,
               'statWlvl' VALUE wt.w_stat_wlvl,
               'dyncWlvl' VALUE wt.w_dync_wlvl,
               'testerNetworkId' VALUE wt.tester_network_id,
               'hydProduct' VALUE wt.w_hyd_product,
               'duration' VALUE wt.duration
             ) ORDER BY wt.w_test_sta_dt
           ) AS gwd_well_test  
      FROM exad_gwd_well_tests wt
     WHERE wt.ep_a_num = l_ep_a_num;

    well_test_rec  well_test_crs%ROWTYPE; 


    CURSOR daily_rmk_crs IS
    SELECT JSON_ARRAYAGG(
             JSON_OBJECT(    
               'egdr_id' VALUE dr.egdr_id,
               'actDt' VALUE dr.w_act_dt,
               'area' VALUE dr.area,
               'status' VALUE dr.status,
               'opRmk' VALUE dr.w_op_rmk,
               'next24HrPlanRrmk' VALUE dr.nxt_24_hr_plan_rmk,
               'drlgSmryRmk' VALUE dr.w_drlg_smry_rmk
             ) ORDER BY dr.w_act_dt
           ) AS gwd_daily_remark
      FROM exad_gwd_daily_remarks dr
     WHERE dr.ep_a_num = l_ep_a_num;

    daily_rmk_rec  daily_rmk_crs%ROWTYPE; 
  
    CURSOR well_design_crs IS 
    SELECT JSON_ARRAYAGG(
             JSON_OBJECT(    
              'staWaterLvl' VALUE g.sta_water_lvl,
              'swLvlTxt' VALUE g.sw_lvl_txt,
              'pumpLvl' VALUE g.pump_lvl,
              'ohFlg' VALUE g.oh_flg,
              'ohRemarks' VALUE g.oh_remarks,
              'gpFlg' VALUE g.gp_flg,
              'gpRemarks' VALUE g.gp_remarks,
              'perforatedFlg' VALUE g.perforated_flg,
              'perforatedRemarks' VALUE g.perforated_remarks,
              'lsFlg' VALUE g.ls_flg,
              'lsRemarks' VALUE g.ls_remarks
             ) ORDER BY g.sta_water_lvl
           ) AS exad_gwd_well_design
      FROM exad_gwd_well_design g
     WHERE g.prewap_seq = ir_seq_rec.prewap_seq;  

    well_design_rec  well_design_crs%ROWTYPE;    
   
  BEGIN

    exad_log_pkg.debug('p_json_in=' || p_json_in);
    DBMS_SESSION.RESET_PACKAGE;
    
--    open_cursor_check('at start');

    -- Check incoming JSON and set the ep_a_num
    IF LENGTH(p_json_in) = 0 THEN
      p_json_in  := '{"racNum":148155, "epANum":98415, "actDate": "05/08/2024", "tabValue":"mr"}';
      l_ep_a_num := 98415;
    ELSE
      l_ep_a_num :=  JSON_VALUE(p_json_in, '$.epANum');  
    END IF;  
            
    -- Check incoming JSON and set the rac_num if required
    IF JSON_VALUE(p_json_in, '$.racNum') IS NULL  THEN

      l_dt := JSON_VALUE(p_json_in, '$.actDate');

      
      $if NOT(exad_db_constants_pkg.is_devl) $then      

        open_cursor_check('before rac');
        OPEN rac_crs;
        FETCH rac_crs INTO rac_rec;
        CLOSE rac_crs;
        open_cursor_check('after rac');

          
        SELECT JSON_TRANSFORM(p_json_in, SET '$.racNum' = rac_rec.rac_num) AS p_json_in 
        INTO p_json_in
        FROM dual;
          
      $end  
        
    END IF;  
    

    $if NOT(exad_db_constants_pkg.is_devl) $then      

      -- Call the morning report procedures
      open_cursor_check('before mr_sec1');
      drlg.drlg_opr_mr_rep_pkg.get_mr_rep_sec1(p_json_in, p_json1, message);      

      open_cursor_check('after mr_sec1');
      SELECT JSON_TRANSFORM(p_json1 , REMOVE '$.RIG_ACTIVITY.racMovTruckloadTot'
                                    , REMOVE '$.RIG_ACTIVITY.racMovPreRelsTruckloads'
                                    , REMOVE '$.RIG_ACTIVITY.racMovLegalRoadFlg'
                                    , REMOVE '$.RIG_ACTIVITY.racMovWinchTruckCnt'
                                    , REMOVE '$.RIG_ACTIVITY.racMovFlatbedTruckCnt'
                                    , REMOVE '$.RIG_ACTIVITY.racMovCranesCnt'
                                    , REMOVE '$.RIG_ACTIVITY.racMovForkliftsCnt'
                                    , REMOVE '$.RIG_ACTIVITY.racMovAsphaltRoadDis'
                                    , REMOVE '$.RIG_ACTIVITY.racMovSkidRoadDis'
                                    , REMOVE '$.RIG_ACTIVITY.wRigMoveDis'
                                    , REMOVE '$.RIG_ACTIVITY.drlgPlanWellDesc'
                                    , REMOVE '$.RIG_ACTIVITY.wellName2'
                                    , REMOVE '$.RIG_ACTIVITY.wellzone'
                                    , REMOVE '$.RIG_ACTIVITY.waterWell'
                                    , REMOVE '$.RIG_ACTIVITY.drlgPlanCmplZone'
                                    , REMOVE '$.RIG_ACTIVITY.epChrAcNum'
                                    , REMOVE '$.RIG_ACTIVITY.wRigActGrpCd'
                                    , REMOVE '$.RIG_ACTIVITY.wDrlgClsfCd'
                                    , REMOVE '$.RIG_ACTIVITY.wDrlgClsfLabl'
                                    , REMOVE '$.RIG_ACTIVITY.wDrlgSftCntgcyFlg'
                                    , REMOVE '$.RIG_ACTIVITY.closeLpDrlgFg'
                                    , REMOVE '$.RIG_ACTIVITY.rigMainCampMvFlg'
                                    , REMOVE '$.RIG_ACTIVITY.racCrewCampDdLatCord'
                                    , REMOVE '$.RIG_ACTIVITY.racCrewCampDdLonCord'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigStatus'
                                    , REMOVE '$.RIG_IDENTIFICATION.description'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigShrtName'
                                    , REMOVE '$.RIG_IDENTIFICATION.sapRigCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.sapAstId'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigLocCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.cstCtrCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.ldsRigCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.orgnCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.opOrgnCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigTypCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigCntrctName'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigCntrctNum'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigCntrctPlStaDt'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigCntrctActlStaDt'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigCntrctExpirDt'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigEndSrvcDt'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigDimCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigHp'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigMaxBopPresRtng'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigMaxHookLoad'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigMaxDpthCap'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigCap'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigCapableTypCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.drlgUnitTypCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigEstMoveRate'
                                    , REMOVE '$.RIG_IDENTIFICATION.svcoCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.sapVndrId'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigDptCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigProp'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigSchedPropCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.opPlanFlg'
                                    , REMOVE '$.RIG_IDENTIFICATION.wRigActStsCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigFixedRdTime'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigGasWellFlg'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigIpAddr'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigOldnameCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigOldnameChngDt'
                                    , REMOVE '$.RIG_IDENTIFICATION.drlgIncentPgmFlg'
                                    , REMOVE '$.RIG_IDENTIFICATION.saudiScoreCntrctReq'
                                    , REMOVE '$.RIG_IDENTIFICATION.saudiScoreAddlPgm'
                                    , REMOVE '$.RIG_IDENTIFICATION.arisRigFlg'
                                    , REMOVE '$.RIG_IDENTIFICATION.arisSrtKey'
                                    , REMOVE '$.RIG_IDENTIFICATION.wRigAutoAdjFlg'
                                    , REMOVE '$.RIG_IDENTIFICATION.racExecBusRuleFlg'
                                    , REMOVE '$.RIG_IDENTIFICATION.rigRmk'
                                    , REMOVE '$.RIG_IDENTIFICATION.epCrDataCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.epCrDataDt'
                                    , REMOVE '$.RIG_IDENTIFICATION.epLtDmoCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.epLtDataModDt'
                                    , REMOVE '$.RIG_IDENTIFICATION.epTrigModCd'
                                    , REMOVE '$.RIG_IDENTIFICATION.epTrigModDt'
                                    , REMOVE '$.RIG_IDENTIFICATION.drlgUnitDescription'
                                    , REMOVE '$.CONTACT.rigContNumPdf'
                                    , REMOVE '$.CONTACT.rigDescriptionPdf'                                    
      ) INTO p_json1
      FROM dual;
    
      open_cursor_check('before mr_sec2');

      drlg.drlg_opr_mr_rep_pkg.get_mr_rep_sec2(p_json_in, p_json2, message);
--DBMS_SESSION.RESET_PACKAGE;
      SELECT JSON_TRANSFORM(p_json2 , REMOVE '$.DRLG_OP_STATUS.wDrlgDlyCst2'
                                    , REMOVE '$.DRLG_OP_STATUS.wMudDlyCst2'
                                    , REMOVE '$.DRLG_OP_STATUS.landingPt'
                                    , REMOVE '$.DRLG_OP_STATUS.wPrevDpthCd'
                                    , REMOVE '$.DRLG_OP_STATUS.wPrsntDpthCd'
                                    , REMOVE '$.DRLG_OP_STATUS.wRigCd'
                                    , REMOVE '$.DRLG_OP_STATUS.epLtDataModDt'
                                    , REMOVE '$.DRLG_OP_STATUS.epLtDmoCd'
                                    , REMOVE '$.DRLG_OP_STATUS.wCsgTopDpth'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgCumCst'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgDlyCst'
                                    , REMOVE '$.DRLG_OP_STATUS.wHolVol'
                                    , REMOVE '$.DRLG_OP_STATUS.wMrEngIn'
                                    , REMOVE '$.DRLG_OP_STATUS.wMudDlyCst'
                                    , REMOVE '$.DRLG_OP_STATUS.wTrgtDayahd'
                                    , REMOVE '$.DRLG_OP_STATUS.racNum'
                                    , REMOVE '$.DRLG_OP_STATUS.primWtrSrcEpANum'
                                    , REMOVE '$.DRLG_OP_STATUS.scndWtrSrcEpANum'
                                    , REMOVE '$.DRLG_OP_STATUS.wCsgBotTvd'
                                    , REMOVE '$.DRLG_OP_STATUS.rigNeedRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.rigLtaDay'
                                    , REMOVE '$.DRLG_OP_STATUS.wLnrTopDpth'
                                    , REMOVE '$.DRLG_OP_STATUS.wLnrBotTvd'
                                    , REMOVE '$.DRLG_OP_STATUS.bopeLtTestDt'
                                    , REMOVE '$.DRLG_OP_STATUS.bopeDrillRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.windRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.safeMtngRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.seaRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.wthrRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.bulkDrlgWtrVol'
                                    , REMOVE '$.DRLG_OP_STATUS.bulkPotWtrVol'
                                    , REMOVE '$.DRLG_OP_STATUS.bulkBa'
                                    , REMOVE '$.DRLG_OP_STATUS.bulkBent'
                                    , REMOVE '$.DRLG_OP_STATUS.bulkCmt'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgMgmtSmryRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.bulkFuelVol'
                                    , REMOVE '$.DRLG_OP_STATUS.equipOnLoc1'
                                    , REMOVE '$.DRLG_OP_STATUS.equipOnLoc2'
                                    , REMOVE '$.DRLG_OP_STATUS.equipOnLoc3'
                                    , REMOVE '$.DRLG_OP_STATUS.equipOnLoc4'
                                    , REMOVE '$.DRLG_OP_STATUS.rpprCmmnRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.rpprInstrRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.rpprOtherRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.trnspStndby'
                                    , REMOVE '$.DRLG_OP_STATUS.foremanRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.epCrDataCd'
                                    , REMOVE '$.DRLG_OP_STATUS.epCrDataDt'
                                    , REMOVE '$.DRLG_OP_STATUS.nonDrlgBhaDesc'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgSuptLid'
                                    , REMOVE '$.DRLG_OP_STATUS.vpDlyRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.mudAvailTypCd'
                                    , REMOVE '$.DRLG_OP_STATUS.mudAvailVol'
                                    , REMOVE '$.DRLG_OP_STATUS.mudReqVol'
                                    , REMOVE '$.DRLG_OP_STATUS.mudReqTypCd'
                                    , REMOVE '$.DRLG_OP_STATUS.mudAvailWt'
                                    , REMOVE '$.DRLG_OP_STATUS.mudReqWt'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanEmpnum'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanEmpnum2'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanEmpnum3'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanEmpnum4'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanEmpnum5'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanName2'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanName3'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanName4'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanName5'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanSvcoCd'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanSvcoCd2'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanSvcoCd3'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanSvcoCd4'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanSvcoCd5'
                                    , REMOVE '$.DRLG_OP_STATUS.mudEngrName'
                                    , REMOVE '$.DRLG_OP_STATUS.mudAramcoFluidSplst'
                                    , REMOVE '$.DRLG_OP_STATUS.mudToolPusher'
                                    , REMOVE '$.DRLG_OP_STATUS.mudEngrRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.mudWhPhoneNum'
                                    , REMOVE '$.DRLG_OP_STATUS.mudCircFrt'
                                    , REMOVE '$.DRLG_OP_STATUS.mudPumpPres'
                                    , REMOVE '$.DRLG_OP_STATUS.mudBotUpTime'
                                    , REMOVE '$.DRLG_OP_STATUS.mudTotCircTime'
                                    , REMOVE '$.DRLG_OP_STATUS.mudFluidSplstRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.wRer100ppm'
                                    , REMOVE '$.DRLG_OP_STATUS.wRer30ppm'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgReqmntCnclRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngName2'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngName3'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngName4'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngName5'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngEmpnum'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngEmpnum2'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngEmpnum3'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngEmpnum4'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngEmpnum5'
                                    , REMOVE '$.DRLG_OP_STATUS.drlgEngUnitOrgnCd'
                                    , REMOVE '$.DRLG_OP_STATUS.drlgEngDivOrgnCd'
                                    , REMOVE '$.DRLG_OP_STATUS.drlgOpDivOrgnCd'
                                    , REMOVE '$.DRLG_OP_STATUS.fuelEngConsVol'
                                    , REMOVE '$.DRLG_OP_STATUS.nxt24HrPlanExecSmryRmk'
                                    , REMOVE '$.DRLG_OP_STATUS.lc50SmplCnt'
                                    , REMOVE '$.DRLG_OP_STATUS.lc50ManifNum'
                                    , REMOVE '$.DRLG_OP_STATUS.lc50SmplDt'
                                    , REMOVE '$.DRLG_OP_STATUS.eqvCircDensTrgtDpth'
                                    , REMOVE '$.DRLG_OP_STATUS.eqvCircDensShoe'
                                    , REMOVE '$.DRLG_OP_STATUS.mudActvSurfVol'
                                    , REMOVE '$.DRLG_OP_STATUS.mudRsrvSurfVol'
                                    , REMOVE '$.DRLG_OP_STATUS.foremanExternalRemark'
                                    , REMOVE '$.DRLG_OP_STATUS.foremanRmkPdf'
                                    , REMOVE '$.DRLG_OP_STATUS.foremanExternalRmkPdf'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanNid'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanNid2'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanNid3'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanNid4'
                                    , REMOVE '$.DRLG_OP_STATUS.wFmanNid5'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngNid'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngNid2'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngNid3'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngNid4'
                                    , REMOVE '$.DRLG_OP_STATUS.wDrlgEngNid5'
                                    , REMOVE '$.DRLG_FM_TOPS.epLtDataModDt'
                                    , REMOVE '$.DRLG_FM_TOPS.epLtDmoCd'
                                    , REMOVE '$.DRLG_FM_TOPS.ltrlName'
                                    , REMOVE '$.DRLG_FM_TOPS.epCrDataCd'
                                    , REMOVE '$.DRLG_FM_TOPS.epCrDataDt'
                                    , REMOVE '$.DRLG_FM_TOPS.racNum'
                                    , REMOVE '$.DRLG_FM_TOPS.dftNum'
                                    , REMOVE '$.NEXT_2_WELL_ACTIVITY.racNum'
                                    , REMOVE '$.NEXT_2_WELL_ACTIVITY.wGnrName'
                                    , REMOVE '$.NEXT_2_WELL_ACTIVITY.rigShrtName'
                                    , REMOVE '$.NEXT_2_WELL_ACTIVITY.wDrlgStaDt'
                                    , REMOVE '$.NEXT_2_WELL_ACTIVITY.wDrlgEndDt'
                                    , REMOVE '$.NEXT_2_WELL_ACTIVITY.today'
                                    , REMOVE '$.NEXT_2_WELL_ACTIVITY.wBatchNum'
                                    , REMOVE '$.NEXT_2_WELL_ACTIVITY.canMove'
                                    , REMOVE '$.NEXT_2_WELL_ACTIVITY.biNum'
                                    , REMOVE '$.NEXT_2_WELL_ACTIVITY.epANum'
      ) INTO p_json2
      FROM dual;

      open_cursor_check('before mr_sec3');
      drlg.drlg_opr_mr_rep_pkg.get_mr_rep_sec3(p_json_in, p_json3, message);
--DBMS_SESSION.RESET_PACKAGE;
      
      SELECT JSON_TRANSFORM(p_json3 , REMOVE '$.DRLG_OP_SMRY.toTm2'
                                    , REMOVE '$.DRLG_OP_SMRY.epANum'
                                    , REMOVE '$.DRLG_OP_SMRY.wActDt'
                                    , REMOVE '$.DRLG_OP_SMRY.wOpTimeCd'
                                    , REMOVE '$.DRLG_OP_SMRY.wOpObjCd'
                                    , REMOVE '$.DRLG_OP_SMRY.wOpDur'
                                    , REMOVE '$.DRLG_OP_SMRY.epLtDataModDt'
                                    , REMOVE '$.DRLG_OP_SMRY.epLtDmoCd'
                                    , REMOVE '$.DRLG_OP_SMRY.ltrlName'
                                    , REMOVE '$.DRLG_OP_SMRY.wDrlgOpDt'
                                    , REMOVE '$.DRLG_OP_SMRY.wOpRmkPdf'
                                    , REMOVE '$.DRLG_OP_SMRY.racNum'
                                    , REMOVE '$.DRLG_OP_SMRY.epCrDataCd'
                                    , REMOVE '$.DRLG_OP_SMRY.epCrDataDt'
                                    , REMOVE '$.DRLG_OP_SMRY.stNmCd'
                                    , REMOVE '$.DRLG_OP_SMRY.wEvntStaDpth'
                                    , REMOVE '$.DRLG_OP_SMRY.wEvntEndDpth'
                                    , REMOVE '$.DRLG_OP_SMRY.svcoCd'
                                    , REMOVE '$.DRLG_OP_SMRY.dopNum'
                                    , REMOVE '$.DRLG_OP_SMRY.lostTmFlg'
                                    , REMOVE '$.DRLG_OP_SMRY.lgcyWOpCd'
                                    , REMOVE '$.DRLG_OP_SMRY.lgcyWOpTimeCd'
                                    , REMOVE '$.DRLG_OP_SMRY.lgcyWOpObjCd'
                                    , REMOVE '$.DRLG_OP_SMRY.lgcyWHolSz'
                                    , REMOVE '$.DRLG_OP_SMRY.lgcyHolSecTypCd'
                                    , REMOVE '$.DRLG_OP_SMRY.dffsNum'
                                    , REMOVE '$.DRLG_OP_SMRY.doosNum'
                                    , REMOVE '$.DRLG_OP_SMRY.dltsNum'
                                    , REMOVE '$.DRLG_OP_SMRY.dltsDffsNum'
                                    , REMOVE '$.DRLG_OP_SMRY.ltDffType'
                                    , REMOVE '$.DRLG_OP_SMRY.ltType'
      ) INTO p_json3
      FROM dual;

/*
      BEGIN 
        drlg.drlg_opr_mr_rep_pkg.get_mr_rep_sec4(p_json_in, p_json4, message);
      EXCEPTION WHEN OTHERS THEN NULL;
      END;  
*/



      -- Get the local data            
      open_cursor_check('before ir');
      OPEN ir_seq_crs;
      FETCH ir_seq_crs INTO ir_seq_rec;
      CLOSE ir_seq_crs;

      open_cursor_check('before gwd ir');
      OPEN gwd_ir_header_crs;
      FETCH gwd_ir_header_crs INTO gwd_ir_header_rec;
      CLOSE gwd_ir_header_crs;
      
      open_cursor_check('before csg');
      OPEN csg_crs;
      FETCH csg_crs INTO csg_rec;
      CLOSE csg_crs;

      open_cursor_check('before tops');
      OPEN tops_crs;
      FETCH tops_crs INTO tops_rec;
      CLOSE tops_crs;

      open_cursor_check('before hydro');
      OPEN hydrogeology_crs;
      FETCH hydrogeology_crs INTO hydrogeology_rec;
      CLOSE hydrogeology_crs;

      open_cursor_check('before water');
      OPEN water_crs;
      FETCH water_crs INTO water_rec;
      CLOSE water_crs;

      open_cursor_check('before prewap');
      OPEN prewap_crs;
      FETCH prewap_crs INTO prewap_rec;
      CLOSE prewap_crs;

      open_cursor_check('before mud');
      OPEN mud_circ_crs;
      FETCH mud_circ_crs INTO mud_circ_rec;
      CLOSE mud_circ_crs;

      open_cursor_check('before well');      
      OPEN well_design_crs;
      FETCH well_design_crs INTO well_design_rec;
      CLOSE well_design_crs;
      

      $end


      open_cursor_check('before well_test');
      OPEN well_test_crs;
      FETCH well_test_crs INTO well_test_rec;
      CLOSE well_test_crs;

      open_cursor_check('before daily_rmk');
      OPEN daily_rmk_crs;
      FETCH daily_rmk_crs INTO daily_rmk_rec;
      CLOSE daily_rmk_crs;
      
      
    $if (exad_db_constants_pkg.is_devl) $then      
    
      p_json_out := ' { ' ||
                      '  "EXAD_GWD_WELL_TESTS":' ||
                      CASE WHEN well_test_rec.gwd_well_test IS NOT NULL THEN well_test_rec.gwd_well_test ELSE '[]' END ||    
                      ', "EXAD_GWD_DAILY_REMARKS":' ||
                      CASE WHEN daily_rmk_rec.gwd_daily_remark IS NOT NULL THEN daily_rmk_rec.gwd_daily_remark ELSE '[]' END ||                                        
                      ' } ';
    
    
    $else

      -- Construct the REFERENCE element
     p_json_ref := CASE WHEN ir_seq_rec.ir_seq IS NOT NULL THEN ', "irSeq":' ||  ir_seq_rec.ir_seq END ||
                   CASE WHEN ir_seq_rec.prewap_seq IS NOT NULL THEN ', "prewapSeq":' || ir_seq_rec.prewap_seq END ||
                   CASE WHEN ir_seq_rec.ep_a_num IS NOT NULL THEN ', "epAnum":'  || ir_seq_rec.ep_a_num END;

      -- Compile the output json     
      p_json_out := ' { ' ||
                    '  "REFERENCE" : [{' || SUBSTR(p_json_ref,3) || '}]' ||
                    ', "RIG_ACTIVITY" :' || JSON_QUERY(p_json1, '$.RIG_ACTIVITY') ||
                    ', "WELL_MASTER":' || JSON_QUERY(p_json1, '$.WELL_MASTER') ||
                    ', "RIG_IDENTIFICATION":' || JSON_QUERY(p_json1, '$.RIG_IDENTIFICATION') ||
                    ', "CONTACT":' || JSON_QUERY(p_json1, '$.CONTACT') ||
                    ', "DRLG_OP_STATUS":' || JSON_QUERY(p_json2, '$.DRLG_OP_STATUS') ||
                    ', "DRLG_FM_TOPS":' || JSON_QUERY(p_json2, '$.DRLG_FM_TOPS') ||
                    ', "DRLG_FD_TDAY":' || JSON_QUERY(p_json2, '$.DRLG_FD_TDAY') ||
                    ', "ROP_DATA":' || JSON_QUERY(p_json2, '$.ROP_DATA') ||
                    ', "NEXT_2_WELL_ACTIVITY":' || JSON_QUERY(p_json2, '$.NEXT_2_WELL_ACTIVITY') ||
                    ', "NEW_TARGET_DAYS":' || JSON_QUERY(p_json2, '$.NEW_TARGET_DAYS') ||
                    ', "actualRm":' || JSON_VALUE(p_json2, '$.actualRm') ||
                    ', "kpiRm":' || JSON_VALUE(p_json2, '$.kpiRm') ||
                    ', "rigMoveDays":' || JSON_VALUE(p_json2, '$.rigMoveDays') ||
                    ', "DRLG_OP_SMRY":' || JSON_QUERY(p_json3, '$.DRLG_OP_SMRY') ||
--                    ', "BITINFO":' || JSON_QUERY(p_json4, '$.BITINFO') ||
                    ', "EXAD_GWD_IR_HEADER":' ||
                      CASE WHEN gwd_ir_header_rec.gwd_ir_header_json IS NOT NULL THEN gwd_ir_header_rec.gwd_ir_header_json ELSE '[]' END ||
                    ', "EXAD_GWD_IR_TOPS":' || 
                      CASE WHEN tops_rec.gwd_ir_tops_json IS NOT NULL THEN tops_rec.gwd_ir_tops_json ELSE '[]' END || 
                      ', "EXAD_GWD_IR_CASING":' ||
                      CASE WHEN csg_rec.gwd_ir_casing IS NOT NULL THEN  csg_rec.gwd_ir_casing ELSE '[]' END ||
                      ', "EXAD_GWD_IR_HYDROGEOLOGY":' || 
                      CASE WHEN hydrogeology_rec.gwd_ir_hydrogeology IS NOT NULL THEN hydrogeology_rec.gwd_ir_hydrogeology ELSE '[]' END ||
                      ', "EXAD_GWD_IR_WATER":' || 
                      CASE WHEN water_rec.gwd_ir_water IS NOT NULL THEN water_rec.gwd_ir_water  ELSE '[]' END ||
                      ', "EXAD_RCD_PREWAP":' || 
                      CASE WHEN prewap_rec.exad_rcd_prewap IS NOT NULL THEN prewap_rec.exad_rcd_prewap ELSE '[]' END ||
                      ', "MUD_CIRC":' ||
                      CASE WHEN mud_circ_rec.mud_circ IS NOT NULL THEN  mud_circ_rec.mud_circ ELSE '[]' END ||    
                      ', "EXAD_GWD_WELL_TESTS":' ||
                      CASE WHEN well_test_rec.gwd_well_test IS NOT NULL THEN well_test_rec.gwd_well_test ELSE '[]' END ||    
                      ', "EXAD_GWD_DAILY_REMARKS":' ||
                      CASE WHEN daily_rmk_rec.gwd_daily_remark IS NOT NULL THEN daily_rmk_rec.gwd_daily_remark ELSE '[]' END ||                                        
                      ', "EXAD_GWD_WELL_DESIGN":' ||
                      CASE WHEN well_design_rec.exad_gwd_well_design IS NOT NULL THEN well_design_rec.exad_gwd_well_design ELSE '[]' END ||                                        
                      ' } ';

    $end    
    
  EXCEPTION
    WHEN OTHERS THEN
      exad_log_pkg.error(SQLCODE, SQLERRM);
      RAISE;


  END drlg_mr_single;  
