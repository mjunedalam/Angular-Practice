# EXAD_GWD_IR_HEADER Table Structure

## Columns of EXAD_GWD_IR_HEADER

| # | Name | Type | Nullable | Default | Comments |
|---|---|---|---|---|---|
| 1 | IR_SEQ | NUMBER | | | |
| 2 | PREWAP_SEQ | NUMBER(6) | | | |
| 3 | LTR_NO | VARCHAR2(20) | Y | | |
| 4 | SCREEN | NVARCHAR2(2000) | Y | | |
| 5 | SAMPLING | NVARCHAR2(2000) | Y | | |
| 6 | LOGGING | NVARCHAR2(2000) | Y | | |
| 7 | COMPLETION | NVARCHAR2(2000) | Y | | |
| 8 | GRAVEL_PACK | NVARCHAR2(2000) | Y | | |
| 9 | ACIDIZATION | NVARCHAR2(2000) | Y | | |
| 10 | DEV_PUMP_TEST | NVARCHAR2(2000) | Y | | |
| 11 | TOPS_REMARKS | VARCHAR2(200) | Y | | |
| 12 | PUBLISH_DT | DATE | Y | | |
| 13 | PUBLISH_FLG | VARCHAR2(1) | Y | 'N' | |
| 14 | CURR_FLG | VARCHAR2(1) | Y | 'Y' | |
| 15 | PUBLISH_BY | VARCHAR2(20) | Y | | |
| 16 | CONT_GEOLOGIST | NUMBER(8) | Y | | |
| 17 | SUB_CONT_GEOLOGIST | NUMBER(8) | Y | | |
| 18 | EP_CR_DATA_DT | DATE | Y | | |
| 19 | EP_LT_DATA_MOD_DT | DATE | Y | | |
| 20 | EP_LT_DMQ_CD | VARCHAR2(30) | Y | | |
| 21 | EP_CR_DATA_CD | VARCHAR2(30) | Y | | |
| 22 | WATER_REMARKS | NVARCHAR2(2000) | Y | | |
| 23 | GEN_REMARKS | NVARCHAR2(2000) | Y | | |
| 24 | CMPL_TYPE | VARCHAR2(10) | Y | | |
| 25 | TRNS_TYPE | VARCHAR2(10) | Y | | |
| 26 | DT_RMKS | NVARCHAR2(2000) | Y | | |
| 27 | MUD_RMKS | NVARCHAR2(2000) | Y | | |
| 28 | TEST_TYPE | VARCHAR2(10) | Y | | |
| 29 | FLOW_RMKS | NVARCHAR2(2000) | Y | | |

