PROCEDURE update_ir_sap_wf_prc (p_ir_seq IN number,
                                   p_wf_id IN number,
                                   p_wf_status IN VARCHAR2,
                                   p_app_user  IN VARCHAR2,
                                   p_do_commit IN VARCHAR2 DEFAULT 'Y',
                                   p_return_value      OUT VARCHAR2) is
  /**********************************************************************
            Procedure : update_ir_data_prc
            Purpose   : To update SAP workflow id and status for a given IR id 
        
            Change history:
            08/19/26  Mazhar Siddiqui      Created
  ************************************************************************ */  
  begin 
            p_return_value:= 'SUCCESS';
            setup(p_app_user);
            exad_log_pkg.debug( '  p_app_user=' || p_app_user ||
                                ', p_do_commit=' || p_do_commit ||
                                ', p_ir_seq='||p_ir_seq||
                                ', p_wf_id='||p_wf_id||
                                ', p_wf_status='||p_wf_status);    
  
  UPDATE exad_gwd_ir_header a
     SET a.sap_wf_id = p_wf_id, a.sap_wf_status = p_wf_status
   WHERE a.ir_seq = p_ir_seq;
  
  exad_util_pkg.do_commit(p_do_commit);
  
  EXCEPTION
            WHEN OTHERS THEN
              ROLLBACK;
              exad_log_pkg.error(SQLCODE, SQLERRM);
              p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
              RETURN;
              
  end update_ir_sap_wf_prc;  