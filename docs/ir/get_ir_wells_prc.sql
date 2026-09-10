PROCEDURE get_ir_wells_prc
(result_crs IN OUT result_crs_type
) is
    /**************************************************************************************************
        Procedure    : get_ir_wells_prc
        Purpose      : Returns list of wells for which IR to be initiated

        Date         By                 Reason
        08/17/26     Mazhar Siddiqui    Created
    **************************************************************************************************/
begin
  OPEN result_crs FOR
    SELECT prewap_seq prewapseq,
    w_prim_hid || '_' || w_num wellname,
    surfacen surfacenorth,
    surfacee surfaceeast,
    target_dpth targetdepth,
    sv_surf_elevf surfaceelevation,
    w_prim_hid primaryholeid,
    w_num wellnumber,
    sv_utm_zn utmzone,
    well_type welltype,
    well_class wellclassification
  from exad_rcd_prewap a
  where div in ('30001739', '30027736')
  and not exists (select 1 from exad_gwd_ir_header b where b.prewap_seq = a.prewap_seq)
  order by w_prim_hid, w_num;

end get_ir_wells_prc;