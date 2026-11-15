PROCEDURE get_ir_offset_water_wells_prc(result_crs OUT result_crs_type) is
  /*****************************************************************************************
       Procedure    :  get_ir_offset_water_wells_prc
       Purpose      : Returns list of off set wells
   
       Date        By               Reason
       11/11/26    Mazhar Siddiqui  Created
  *******************************************************************************************/
begin
  OPEN result_crs FOR
    select *
      from (select a.wb_name,
                   a.aquifer,
                   a.td,
                   a.rate,
                   a.rpm,
                   a.swl,
                   a.final_pwl,
                   a.drawdown,
                   a.spec_capacity,
                   a.temp,
                   a.field_tds,
                   a.test_duration,
                   a.h2s,
                   a.sediments_per,a.ep_lt_data_mod_dt,
                   RANK() OVER (PARTITION BY a.wb_name ORDER BY a.ep_lt_data_mod_dt desc) rank_no
              from EXAD.EXAD_GWD_IR_WATER a)
     where rank_no = 1
     order by 1;

end get_ir_offset_water_wells_prc;