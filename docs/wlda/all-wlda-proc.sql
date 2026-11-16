PROCEDURE insert_wlda_letters_prc
        (
          p_prewap_seq IN exad_agwa_wlda_ltr.prewap_seq%TYPE,
          p_sv_xutm_cord IN exad_agwa_wlda_ltr.sv_xutm_cord%TYPE,
          p_sv_yutm_cord IN exad_agwa_wlda_ltr.sv_yutm_cord%TYPE,
          p_sv_utm_zn IN exad_agwa_wlda_ltr.sv_utm_zn%TYPE,
          p_ltr_rmks IN exad_agwa_wlda_ltr.ltr_rmks%TYPE,
          p_sap_wf_id IN exad_agwa_wlda_ltr.sap_wf_id%TYPE,
          p_sap_wf_status IN exad_agwa_wlda_ltr.sap_wf_status%TYPE,
          p_sap_wf_aprv_dt IN exad_agwa_wlda_ltr.sap_wf_aprv_dt%TYPE,
         p_app_user          IN VARCHAR2,
         p_do_commit         IN VARCHAR2 DEFAULT 'Y',
          p_ltr_id           OUT exad_agwa_wlda_ltr.ltr_id%TYPE,
          p_return_value      OUT VARCHAR2
        ) is
       /**********************************************************************
                  Procedure : insert_wlda_letters_prc
                  Purpose   : To insert WLDA letters


                  Change history:
                  11/12/26  Mazhar Siddiqui      Created
        ************************************************************************ */  
                 BEGIN
                  setup(p_app_user);
                  exad_log_pkg.debug( ' p_prewap_seq ='|| p_prewap_seq||
                                       ' p_sv_xutm_cord ='|| p_sv_xutm_cord||
                                      ' p_sv_yutm_cord ='|| p_sv_yutm_cord||
                                      ' p_sv_utm_zn ='|| p_sv_utm_zn||
                                      ' p_ltr_rmks ='|| p_ltr_rmks||
                                      ' p_sap_wf_id ='|| p_sap_wf_id||
                                      ' p_sap_wf_status ='|| p_sap_wf_status||
                                      ' p_sap_wf_aprv_dt ='|| p_sap_wf_aprv_dt||
                                      ' p_app_user ='|| p_app_user||
                                     ', p_do_commit=' || p_do_commit);




                    INSERT INTO exad_agwa_wlda_ltr
                      (prewap_seq, 
                        sv_xutm_cord, 
                        sv_yutm_cord, 
                        sv_utm_zn, 
                        ltr_rmks, 
                        sap_wf_id, 
                        sap_wf_status, 
                        sap_wf_aprv_dt)
                    VALUES
                      (p_prewap_seq, 
                         p_sv_xutm_cord, 
                        p_sv_yutm_cord, 
                        p_sv_utm_zn, 
                        p_ltr_rmks, 
                        p_sap_wf_id, 
                        p_sap_wf_status, 
                        p_sap_wf_aprv_dt)
                     RETURNING
                        ltr_id INTO p_ltr_id;


                  exad_util_pkg.do_commit(p_do_commit);


                EXCEPTION
                  WHEN OTHERS THEN
                    ROLLBACK;
                    exad_log_pkg.error(SQLCODE, SQLERRM);
                    p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
                    RETURN;
        end insert_wlda_letters_prc; 


 PROCEDURE update_wlda_letters_prc(p_prewap_seq     IN exad_agwa_wlda_ltr.prewap_seq%TYPE,
                                       p_ltr_id         IN exad_agwa_wlda_ltr.ltr_id%TYPE,
                                       --p_sv_xutm_cord   IN exad_agwa_wlda_ltr.sv_xutm_cord%TYPE,
                                       --p_sv_yutm_cord   IN exad_agwa_wlda_ltr.sv_yutm_cord%TYPE,
                                       --p_sv_utm_zn      IN exad_agwa_wlda_ltr.sv_utm_zn%TYPE,
                                       p_ltr_rmks       IN exad_agwa_wlda_ltr.ltr_rmks%TYPE,
                                       p_sap_wf_id      IN exad_agwa_wlda_ltr.sap_wf_id%TYPE,
                                       p_sap_wf_status  IN exad_agwa_wlda_ltr.sap_wf_status%TYPE,
                                       p_sap_wf_aprv_dt IN exad_agwa_wlda_ltr.sap_wf_aprv_dt%TYPE,
                                       p_app_user       IN VARCHAR2,
                                       p_do_commit      IN VARCHAR2 DEFAULT 'Y',
                                       p_return_value   OUT VARCHAR2) is
      /**********************************************************************
                  Procedure : update_wlda_letters_prc
                  Purpose   : To update WLDA letters


                  Change history:
                  11/12/26  Mazhar Siddiqui      Created
        ************************************************************************ */  
                BEGIN
                  setup(p_app_user);
                  exad_log_pkg.debug( ' p_prewap_seq ='|| p_prewap_seq||
                                      ' p_ltr_id ='|| p_ltr_id||
                                      ' p_ltr_rmks ='|| p_ltr_rmks||
                                      ' p_sap_wf_id ='|| p_sap_wf_id||
                                      ' p_sap_wf_status ='|| p_sap_wf_status||
                                      ' p_sap_wf_aprv_dt ='|| p_sap_wf_aprv_dt||
                                      ' p_app_user ='|| p_app_user||
                                      ', p_do_commit=' || p_do_commit);




                  UPDATE exad_agwa_wlda_ltr
                     SET ltr_rmks          = p_ltr_rmks,
                         sap_wf_id         = p_sap_wf_id,
                         sap_wf_status = p_sap_wf_status,
                         sap_wf_aprv_dt     = p_sap_wf_aprv_dt 
                  WHERE  prewap_seq = p_prewap_seq
                  and  ltr_id = p_ltr_id;      




                  exad_util_pkg.do_commit(p_do_commit);


                EXCEPTION
                  WHEN OTHERS THEN
                    ROLLBACK;
                    exad_log_pkg.error(SQLCODE, SQLERRM);
                    p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
                    RETURN;
  end update_wlda_letters_prc; 

PROCEDURE delete_wlda_letters_prc(p_prewap_seq   IN exad_gwd_well_tests.egwt_id%TYPE,
                                     p_ltr_id       IN exad_agwa_wlda_ltr.ltr_id%TYPE,
                                     p_app_user     IN VARCHAR2,
                                     p_do_commit    IN VARCHAR2 DEFAULT 'Y',
                                     p_return_value OUT VARCHAR2) IS
     /**********************************************************************
               Procedure : delete_wlda_letters_prc
               Purpose   : To delete WLDA letters


               Change history:
               11/12/26  Mazhar Siddiqui      Created
     ************************************************************************ */


   BEGIN
     setup(p_app_user);
     exad_log_pkg.debug(' p_prewap_seq =' || p_prewap_seq || ' p_ltr_id =' ||
                        p_ltr_id || ' p_app_user =' || p_app_user ||
                        ', p_do_commit=' || p_do_commit);


     DELETE FROM exad_agwa_wlda_ltr
      WHERE prewap_seq = p_prewap_seq
        and ltr_id = p_ltr_id;


     exad_util_pkg.do_commit(p_do_commit);


   EXCEPTION
     WHEN OTHERS THEN
       ROLLBACK;
       exad_log_pkg.error(SQLCODE, SQLERRM);
       p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
       RETURN;


   END delete_wlda_letters_prc;
                -- NoFormat End