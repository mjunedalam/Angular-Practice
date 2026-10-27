

PROCEDURE strat_info_lookup(result_crs IN OUT result_crs_type) IS

BEGIN
    exad_log_pkg.debug('In strat_info_lookup...');

    OPEN result_crs FOR
        SELECT i.st_nm_cd code
             , i.st_long_cd description
             , i.st_desc
        FROM strat_info i
        ORDER BY 2;

END strat_info_lookup;