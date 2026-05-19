import { IBitInfo } from 'src/app/shared/models/wwell/bit-info.model';
import { ICasingIR } from 'src/app/shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from 'src/app/shared/models/wwell/drlg-csg.model';
import { IContact } from 'src/app/shared/models/wwell/contact.model';
import { IDrillingFootage } from 'src/app/shared/models/wwell/drilling-footage.model';
import { IDrillingOperationStatus } from 'src/app/shared/models/wwell/drilling-operation-status.model';
import { IDrillingOperationSummary } from 'src/app/shared/models/wwell/drilling-operation-summary.model';
import { IFormationTops } from 'src/app/shared/models/wwell/formation-tops.model';
import { IHeaderIR } from 'src/app/shared/models/wwell/header-ir.model';
import { IHydrogeologyIR } from 'src/app/shared/models/wwell/hydrogeology-ir.model';
import { INewTargetDays } from 'src/app/shared/models/wwell/new-target-days.model';
import { INextWellActivity } from 'src/app/shared/models/wwell/next-well-activity.model';
import { IPreWellData } from 'src/app/shared/models/wwell/pre-well-data.model';
import { IRigActivity } from 'src/app/shared/models/wwell/rig-activity.model';
import { IRigIdentification } from 'src/app/shared/models/wwell/rig-identification.model';
import { IROPData } from 'src/app/shared/models/wwell/rop-data.model';
import { ITopsIR } from 'src/app/shared/models/wwell/tops-ir.model';
import { IWaterIR } from 'src/app/shared/models/wwell/water-ir.model';
import { IWaterWellTestOutcome } from 'src/app/shared/models/wwell/water-well-test-outcome.model';
import { IWellMaster } from 'src/app/shared/models/wwell/well-master.model';
import { IMudCirculation } from '@models/well-design/mud-circulation.model';
import { IWellDesign } from 'src/app/shared/models/wwell/well-design.model';

export interface IDailyRemarks {
    status?: string | null;
    opRmk?: string | null;
    next24HrPlanRrmk?: string | null;
    drlgSmryRmk?: string | null;
    egdr_id?: number | null;
    area?: string | null;
}

export interface IWellData {
    RIG_ACTIVITY: IRigActivity[];
    WELL_MASTER: IWellMaster[];
    RIG_IDENTIFICATION: IRigIdentification[];
    CONTACT: IContact[];
    DRLG_OP_STATUS: IDrillingOperationStatus[];
    DRLG_FM_TOPS: IFormationTops[];
    DRLG_FD_TDAY: IDrillingFootage[];
    ROP_DATA: IROPData[];
    NEXT_2_WELL_ACTIVITY: INextWellActivity[];
    NEW_TARGET_DAYS: INewTargetDays[];
    DRLG_OP_SMRY: IDrillingOperationSummary[];
    BITINFO: IBitInfo[];
    EXAD_GWD_IR_HEADER: IHeaderIR[];
    EXAD_GWD_IR_TOPS: ITopsIR[];
    EXAD_GWD_IR_CASING: ICasingIR[];
    EXAD_GWD_IR_HYDROGEOLOGY: IHydrogeologyIR[];
    EXAD_GWD_IR_WATER: IWaterIR[];
    EXAD_RCD_PREWAP: IPreWellData[];
    WATER_WELL_TEST_OUTCOME: IWaterWellTestOutcome[];
    EXAD_GWD_WELL_TESTS?: IWaterWellTestOutcome[];
    EXAD_GWD_WELL_DESIGN?: IWellDesign[];
    EXAD_GWD_DAILY_REMARKS?: IDailyRemarks[];
    MUD_CIRC?: IMudCirculation[];
    DRLG_CSG?: IDrlgCsg[];
    actualRm?: number;
    kpiRm?: number;
    rigMoveDays?: number;
}