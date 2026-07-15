-- Param SIGNATURE confirmed from the office extraction (2026-07-15) — the ordering
-- below (p_remarks, p_egwt_id, p_app_user, p_do_commit, p_return_value at the tail)
-- matches what's actually deployed. GwdWellTestsMapper.callUpdateGwdWellTest was
-- fixed to match this exact order (p_remarks and p_egwt_id were swapped before).
--
-- The BODY below is still INFERRED, not confirmed. The office extraction's body for
-- this procedure was clearly corrupted/mismatched (it was an INSERT...VALUES...
-- RETURNING INTO p_egwt_id, which can't be real — p_egwt_id is IN-only here, and
-- RETURNING INTO requires OUT/IN OUT — most likely the insert proc's body got pasted
-- under this signature during the screenshot-to-text extraction). The body here is
-- reconstructed by analogy with insert_gwd_well_test's confirmed body: setup(p_app_user)
-- first, and app_user is NOT written to a table column (only used for setup()) — only
-- remarks is persisted, matching insert's confirmed INSERT column list. VERIFY this
-- against a clean re-capture of the real UPDATE...SET body before deploying.
PROCEDURE update_gwd_well_test
(
    p_ep_a_num          IN exad_gwd_well_tests.ep_a_num%TYPE,
    p_rsvr_cd           IN exad_gwd_well_tests.rsvr_cd%TYPE,
    p_w_hyd_test_typ_cd IN exad_gwd_well_tests.w_hyd_test_typ_cd%TYPE,
    p_w_test_sta_dt     IN exad_gwd_well_tests.w_test_sta_dt%TYPE,
    p_w_temp            IN exad_gwd_well_tests.w_temp%TYPE,
    p_w_hyd_h2s_cnc     IN exad_gwd_well_tests.w_hyd_h2s_cnc%TYPE,
    p_w_wtr_sa_tds_cnc  IN exad_gwd_well_tests.w_wtr_sa_tds_cnc%TYPE,
    p_w_rpm             IN exad_gwd_well_tests.w_rpm%TYPE,
    p_siwhp             IN exad_gwd_well_tests.siwhp%TYPE,
    p_w_hyd_pmp_dpth    IN exad_gwd_well_tests.w_hyd_pmp_dpth%TYPE,
    p_w_hyd_prod_rt     IN exad_gwd_well_tests.w_hyd_prod_rt%TYPE,
    p_w_stat_wlvl       IN exad_gwd_well_tests.w_stat_wlvl%TYPE,
    p_w_dync_wlvl       IN exad_gwd_well_tests.w_dync_wlvl%TYPE,
    p_tester_network_id IN exad_gwd_well_tests.tester_network_id%TYPE,
    p_w_hyd_product     IN exad_gwd_well_tests.w_hyd_product%TYPE,
    p_duration          IN exad_gwd_well_tests.duration%TYPE,
    p_w_fwhp            IN exad_gwd_well_tests.w_fwhp%TYPE,
    p_remarks           IN exad_gwd_well_tests.remarks%TYPE,
    p_egwt_id           IN exad_gwd_well_tests.egwt_id%TYPE,
    p_app_user          IN VARCHAR2,
    p_do_commit         IN VARCHAR2 DEFAULT 'Y',
    p_return_value      OUT VARCHAR2
) IS

BEGIN
    setup(p_app_user);

    exad_log_pkg.debug(' p_ep_a_num=' || p_ep_a_num ||
                       ', p_rsvr_cd=' || p_rsvr_cd ||
                       ', p_w_hyd_test_typ_cd=' || p_w_hyd_test_typ_cd ||
                       ', p_w_test_sta_dt=' || p_w_test_sta_dt ||
                       ', p_w_temp=' || p_w_temp ||
                       ', p_w_hyd_h2s_cnc=' || p_w_hyd_h2s_cnc ||
                       ', p_w_wtr_sa_tds_cnc=' || p_w_wtr_sa_tds_cnc ||
                       ', p_w_rpm=' || p_w_rpm ||
                       ', p_siwhp=' || p_siwhp ||
                       ', p_w_hyd_pmp_dpth=' || p_w_hyd_pmp_dpth ||
                       ', p_w_hyd_prod_rt=' || p_w_hyd_prod_rt ||
                       ', p_w_stat_wlvl=' || p_w_stat_wlvl ||
                       ', p_w_dync_wlvl=' || p_w_dync_wlvl ||
                       ', p_tester_network_id=' || p_tester_network_id ||
                       ', p_w_hyd_product=' || p_w_hyd_product ||
                       ', p_duration=' || p_duration ||
                       ', p_w_fwhp=' || p_w_fwhp ||
                       ', p_remarks=' || p_remarks ||
                       ', p_egwt_id=' || p_egwt_id ||
                       ', p_do_commit=' || p_do_commit);

    UPDATE exad_gwd_well_tests
    SET ep_a_num          = p_ep_a_num,
        rsvr_cd           = p_rsvr_cd,
        w_hyd_test_typ_cd = p_w_hyd_test_typ_cd,
        w_test_sta_dt     = p_w_test_sta_dt,
        w_temp            = p_w_temp,
        w_hyd_h2s_cnc     = p_w_hyd_h2s_cnc,
        w_wtr_sa_tds_cnc  = p_w_wtr_sa_tds_cnc,
        w_rpm             = p_w_rpm,
        siwhp             = p_siwhp,
        w_hyd_pmp_dpth    = p_w_hyd_pmp_dpth,
        w_hyd_prod_rt     = p_w_hyd_prod_rt,
        w_stat_wlvl       = p_w_stat_wlvl,
        w_dync_wlvl       = p_w_dync_wlvl,
        tester_network_id = p_tester_network_id,
        w_hyd_product     = p_w_hyd_product,
        duration          = p_duration,
        w_fwhp            = p_w_fwhp,
        remarks           = p_remarks
    WHERE egwt_id = p_egwt_id;

    exad_util_pkg.do_commit(p_do_commit);

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        exad_log_pkg.error(SQLCODE, SQLERRM);
        p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
        RETURN;

END update_gwd_well_test;
