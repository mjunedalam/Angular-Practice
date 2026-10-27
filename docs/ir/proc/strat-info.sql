PROCEDURE strat_list
(
    result_crs OUT result_crs_type
)
IS

BEGIN
    exad_util_queries_pkg.strat_info_lookup(result_crs);
END strat_list;