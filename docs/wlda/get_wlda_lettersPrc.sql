PROCEDURE get_wlda_letters_prc(p_prewap_seq in number, p_ltr_id in number,result_crs OUT result_crs_type) is
  /*****************************************************************************************
       Procedure    :  get_wlda_letters_prc
       Purpose      : Returns WLDA letters for one or all prewap seq.
   
       Date        By               Reason
       11/11/26    Mazhar Siddiqui  Created
  *******************************************************************************************/
begin
  OPEN result_crs FOR
    select a.*,
       b.w_prim_hid,
       b.w_num,
       b.surfacen,
       b.surfacee,
       b.sv_surf_elev,
       b.sv_utm_zn,
       b.well_type,
       b.well_class,
       b.objectives,
       b.div,
       b.team,
       b.td_md,
       b.target_form,
       b.w_bore,
       b.sv_surf_elevf,
       b.target_dpth,
       b.gosp_area_plant,
       b.expl_wb_name,
       b.target_well_type, 
       case
         when a.sap_wf_status = 'APPROVED' and row_number()
          over(partition by a.prewap_seq order by case
                     when a.sap_wf_status = 'APPROVED' then
                      0
                     else
                      1
                   end,
                   a.sap_wf_aprv_dt desc nulls last,
                   a.ltr_id desc) = 1 then
          'Y'
         else
          'N'
       end as current_flg
  from exad_agwa_wlda_ltr a
  join exad_rcd_prewap b
    on a.prewap_seq = b.prewap_seq
    where a.prewap_seq = nvl(p_prewap_seq, a.prewap_seq)
    and a.ltr_id = nvl(p_ltr_id, a.ltr_id)
    order by a.prewap_seq,a.ltr_id;

end get_wlda_letters_prc;