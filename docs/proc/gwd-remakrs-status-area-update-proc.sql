-- Confirmed from the actual office/deployed Oracle procedure (extracted 2026-07-15).
-- Earlier version of this file predated the p_app_user param.
--
-- BUG FOUND & FIXED (2026-07-15): GwdDailyRemarksMapper.callUpdateGwdDailyRemark had
-- p_egdr_id bound as the FIRST parameter, but the real proc puts it at position 8
-- (right after p_w_drlg_smry_rmk, before p_app_user). Since {call pkg.proc(?,?,...)}
-- binds positionally, that off-by-one shifted every parameter: ep_a_num got the row's
-- own id, area/status/remarks each landed one column over, and p_w_drlg_smry_rmk
-- (TEXT) ended up bound against the real p_egdr_id (NUMBER) slot — producing
-- ORA-06502: character to number conversion error, which rolled back the whole
-- UPDATE. This is why W_OP_RMK / W_DRLG_SMRY_RMK appeared "always null" — the
-- update never actually committed. Fixed by moving p_egdr_id to position 8 in the
-- Java @Select string to match this real signature.
PROCEDURE update_gwd_daily_remark
(
    p_ep_a_num               IN exad_gwd_daily_remarks.ep_a_num%TYPE,
    p_w_act_dt               IN exad_gwd_daily_remarks.w_act_dt%TYPE,
    p_area                   IN exad_gwd_daily_remarks.area%TYPE,
    p_status                 IN exad_gwd_daily_remarks.status%TYPE,
    p_w_op_rmk               IN exad_gwd_daily_remarks.w_op_rmk%TYPE,
    p_nxt_24_hr_plan_rmk     IN exad_gwd_daily_remarks.nxt_24_hr_plan_rmk%TYPE,
    p_w_drlg_smry_rmk        IN exad_gwd_daily_remarks.w_drlg_smry_rmk%TYPE,
    p_egdr_id                IN exad_gwd_daily_remarks.egdr_id%TYPE,
    p_app_user               IN VARCHAR2,
    p_do_commit              IN VARCHAR2 DEFAULT 'Y',
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
        ', p_egdr_id=' || p_egdr_id ||
        ', p_do_commit=' || p_do_commit
    );

    UPDATE exad_gwd_daily_remarks
    SET ep_a_num = p_ep_a_num,
        w_act_dt = p_w_act_dt,
        area = p_area,
        status = p_status,
        w_op_rmk = p_w_op_rmk,
        nxt_24_hr_plan_rmk = p_nxt_24_hr_plan_rmk,
        w_drlg_smry_rmk = p_w_drlg_smry_rmk
    WHERE egdr_id = p_egdr_id;

    exad_util_pkg.do_commit(p_do_commit);

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        exad_log_pkg.error(SQLCODE, SQLERRM);
        p_return_value := exad_util_pkg.user_err_msg(SQLERRM);
        RETURN;
END update_gwd_daily_remark;
