FUNCTION get_wf_next_id_fnc return number is
 /*****************************************************************************************
      Function     : get_wf_next_id_fnc
      Purpose      : Return unique id for SAP workflow
  
      Change history:
      9/2/2026  Mazhar Siddiqui   Created
  *******************************************************************************************/
w_id number ;
begin 
  SELECT exad_gwd_sq01.nextval INTO w_id FROM dual;
  return w_id;
end get_wf_next_id_fnc;