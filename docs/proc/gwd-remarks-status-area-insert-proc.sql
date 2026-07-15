-- Confirmed from the actual office/deployed Oracle procedure (extracted 2026-07-15).
-- Earlier version of this file predated the p_app_user param and had a
-- w_drle_smry_rmk typo (should be w_drlg_smry_rmk) — both corrected below.
-- GwdDailyRemarksMapper.callInsertGwdDailyRemark's param order already matched
-- this signature exactly — no Java-side fix was needed for insert.
PROCEDURE insert_gwd_daily_remark
(
    p_ep_a_num               IN exad_gwd_daily_remarks.ep_a_num%TYPE,
    p_w_act_dt               IN exad_gwd_daily_remarks.w_act_dt%TYPE,
    p_area                   IN exad_gwd_daily_remarks.area%TYPE,
    p_status                 IN exad_gwd_daily_remarks.status%TYPE,
    p_w_op_rmk               IN exad_gwd_daily_remarks.w_op_rmk%TYPE,
    p_nxt_24_hr_plan_rmk     IN exad_gwd_daily_remarks.nxt_24_hr_plan_rmk%TYPE,
    p_w_drlg_smry_rmk        IN exad_gwd_daily_remarks.w_drlg_smry_rmk%TYPE,
    p_app_user               IN VARCHAR2,
    p_do_commit              IN VARCHAR2 DEFAULT 'Y',
    p_egdr_id                OUT exad_gwd_daily_remarks.egdr_id%TYPE,
    p_return_value           OUT VARCHAR2
) IS

BEGIN
    setup(p_app_user);
    exad_log_pkg.debug(
        'p_ep_a_num=' || p_ep_a_num ||
        ', p_w_act_dt=' || p_w_act_dt ||
        ', p_area=' || p_area ||
        ', p_status=' || p_status ||
        ', p_w_op_rmk=' || p_w_op_rmk ||
        ', p_nxt_24_hr_plan_rmk=' || p_nxt_24_hr_plan_rmk ||
        ', p_w_drlg_smry_rmk=' || p_w_drlg_smry_rmk ||
        ', p_do_commit=' || p_do_commit
    );

    INSERT INTO exad_gwd_daily_remarks
    (
        ep_a_num,
        w_act_dt,
        area,
        status,
        w_op_rmk,
        nxt_24_hr_plan_rmk,
        w_drlg_smry_rmk
    )
    VALUES
    (
        p_ep_a_num,
        p_w_act_dt,
        p_area,
        p_status,
        p_w_op_rmk,
        p_nxt_24_hr_plan_rmk,
        p_w_drlg_smry_rmk
    )
    RETURNING egdr_id INTO p_egdr_id;

    exad_util_pkg.do_commit(p_do_commit);

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        exad_log_pkg.error(SQLCODE, SQLERRM);
        p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
END insert_gwd_daily_remark;
