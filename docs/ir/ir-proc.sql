PROCEDURE get_ir_header_prc
(p_ir_seq IN Number,
 result_crs IN OUT result_crs_type
) is
/******************************************************************************
    Procedure   : get_ir_header_prc
    Purpose     : Returns IR header information for a given IR sequence number. Pass NULL for all records

    Date        By              Reason
    08/17/26    Mazhar Siddiqui Created
******************************************************************************/
begin
  OPEN result_crs FOR
    SELECT * from exad_gwd_ir_header a
    where a.ir_seq = nvl(p_ir_seq,a.ir_seq);
end get_ir_header_prc;

PROCEDURE get_ir_wells_prc
(result_crs IN OUT result_crs_type
) is
/******************************************************************************
    Procedure   : get_ir_wells_prc
    Purpose     : Returns list of wells for which IR to be initiated

    Date        By              Reason
    08/17/26    Mazhar Siddiqui Created
******************************************************************************/
begin
  OPEN result_crs FOR
    SELECT * from exad_gwd_ir_header a;
    --where a.ir_seq = nvl(p_ir_seq,a.ir_seq);
end get_ir_wells_prc;