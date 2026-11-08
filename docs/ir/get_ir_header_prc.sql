PROCEDURE get_ir_header_prc
       (p_ir_seq IN Number, 
        result_crs IN OUT result_crs_type
       ) is
         /*****************************************************************************************
            Procedure    : get_ir_header_prc
            Purpose      : Returns IR header information for a given IR sequence number. Pass NULL for all records
        
            Date        By               Reason
            08/17/26    Mazhar Siddiqui  Created
       *******************************************************************************************/
     begin 
       OPEN result_crs FOR
           SELECT a.*, b.w_prim_hid,b.w_num,b.expl_wb_name from exad_gwd_ir_header a, exad_rcd_prewap b
           where a.prewap_seq = b.prewap_seq and a.ir_seq = nvl(p_ir_seq,a.ir_seq)
           and a.curr_flg = 'Y';
     end get_ir_header_prc;