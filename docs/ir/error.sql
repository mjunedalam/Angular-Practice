       -- Merge & delete  - Well Design
        -- Check for new Well Design
        SELECT t.wd_seq, t.action into w_wd_seq, w_ir_action
          FROM  json_table(w_json,
                          '$[*]'
                          COLUMNS(table_name VARCHAR2(30) PATH '$.table',
                                  NESTED PATH '$.data[*]'
                                  COLUMNS(action VARCHAR2(30) PATH '$.action',
                                          wd_seq NUMBER(22) PATH  '$.wd_seq'))) t
         WHERE upper(t.table_name) = 'EXAD_GWD_IR_WATER' ;