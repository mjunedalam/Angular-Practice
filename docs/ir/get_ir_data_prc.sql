 PROCEDURE get_ir_data_prc
       (p_ir_seq IN Number, 
        p_ir_json OUT CLOB
       ) is
         /*****************************************************************************************
            Procedure    : get_ir_data_prc
            Purpose      : Returns header, hydrology, water, casing, tops, well design for a given IR sequence number in single JSON format
        
            Date        By               Reason
            08/17/26    Mazhar Siddiqui  Created
       *******************************************************************************************/
     w_ir_json clob;
     begin 
  
       for j_rec in (
             SELECT JSON_OBJECT('table' value 'EXAD_GWD_IR_HEADER', 'data' VALUE
                      COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT(p.* RETURNING CLOB) RETURNING CLOB)
                                 FROM exad_gwd_ir_header p where p.ir_seq = p_ir_seq) ,
                               TO_CLOB('[]')) FORMAT JSON RETURNING CLOB) json_ir_data_obj
             FROM dual 
             UNION ALL
             SELECT ','||JSON_OBJECT('table' value 'EXAD_GWD_IR_TOPS', 'data' VALUE
                      COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT(p.* RETURNING CLOB) RETURNING CLOB)
                                 FROM exad_gwd_ir_tops p where p.ir_seq = p_ir_seq) ,
                               TO_CLOB('[]')) FORMAT JSON RETURNING CLOB)  
             FROM dual
            UNION ALL
             SELECT ','||JSON_OBJECT('table' value 'EXAD_GWD_IR_HYDROGEOLOGY', 'data' VALUE
                      COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT(p.* RETURNING CLOB) RETURNING CLOB)
                                 FROM exad_gwd_ir_hydrogeology p where p.ir_seq = p_ir_seq) ,
                               TO_CLOB('[]')) FORMAT JSON RETURNING CLOB)  
             FROM dual
            UNION ALL
             SELECT ','||JSON_OBJECT('table' value 'EXAD_GWD_IR_WATER', 'data' VALUE
                      COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT(p.*,'w_gnr_name'
                                                             VALUE
                                                             ut.wn(p.ep_a_num) RETURNING CLOB) RETURNING CLOB)
                                 FROM exad_gwd_ir_water p where p.ir_seq = p_ir_seq) ,
                               TO_CLOB('[]')) FORMAT JSON RETURNING CLOB)  
             FROM dual
           UNION ALL
             SELECT ','||JSON_OBJECT('table' value 'EXAD_GWD_IR_CASING', 'data' VALUE
                      COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT(p.* RETURNING CLOB) RETURNING CLOB)
                                 FROM exad_gwd_ir_casing p where p.ir_seq = p_ir_seq) ,
                               TO_CLOB('[]')) FORMAT JSON RETURNING CLOB)  
             FROM dual
           UNION ALL
             SELECT ','||JSON_OBJECT('table' value 'EXAD_GWD_WELL_DESIGN', 'data' VALUE
                      COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT(p.* RETURNING CLOB) RETURNING CLOB)
                                 FROM exad_gwd_well_design p where p.prewap_seq in (select h.prewap_seq from exad_gwd_ir_header h where h.ir_seq = p_ir_seq)) ,
                               TO_CLOB('[]')) FORMAT JSON RETURNING CLOB) FROM dual
           UNION ALL
             SELECT  ','||JSON_OBJECT('table' value 'EXAD_RCD_PREWAP', 'data' VALUE
                      COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT(p.* RETURNING CLOB) RETURNING CLOB)
                                 FROM (select p.*,ph.w_prim_hid_name from exad_rcd_prewap p 
                                 left join primary_holeid ph on p.w_prim_hid = ph.w_prim_hid
                                 where p.prewap_seq in (select h.prewap_seq from exad_gwd_ir_header h where h.ir_seq = p_ir_seq)) p) ,
                               TO_CLOB('[]')) FORMAT JSON RETURNING CLOB) FROM dual) loop



        w_ir_json := w_ir_json||j_rec.json_ir_data_obj;

        end loop;
        
        p_ir_json := '['||w_ir_json||']';

        end get_ir_data_prc; 