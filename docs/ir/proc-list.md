# Procedure Specification

| Procedure | IN | OUT | Description |
| :--- | :--- | :--- | :--- |
| `exad_agwa_queries_pkg.get_ir_header_prc` | `p_ir_seq` | `result_crs` | Returns IR header information for a given IR sequence number. Pass `NULL` for all records. |
| `exad_agwa_queries_pkg.get_ir_wells_prc` | | `result_crs` | Returns list of wells (`well_name`, `prewap_seq`) for which IR to be initiated. |
| `exad_agwa_queries_pkg.get_ir_data_prc` | `p_ir_seq` | `p_json_out` | Returns header, hydrology, water, casing, tops, well design (all columns except audit columns) for a given IR sequence number in single JSON format. |
| `exad_agwa_iud_pkg.update_ir_data_prc` | `p_json_in` | `p_status` | JSON input contains all the data that need to be inserted/updated/deleted for a single IR sequence number. |