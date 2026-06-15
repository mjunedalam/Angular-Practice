import { IWellData } from '@models/well-design/well-data.model';
import {
  DIAGRAM_LAYOUT,
  DiagramLayout,
  WellboreDiagramData,
} from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IDrillingOperationStatus } from '@shared/models/wwell/drilling-operation-status.model';
import { IFormationTops } from '@shared/models/wwell/formation-tops.model';
import { IPreWellData } from '@shared/models/wwell/pre-well-data.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';

export class WellboreTestDataUtil {
  static readonly plannedTargetDepthFt = 5000;
  static readonly currentDepthBeyondTargetFt = 6500;
  static readonly displayDepthPaddingFt = 500;
  static readonly linerDepthFt = 3430;
  static readonly overrunCompletionLengthFt = 1200;
  static readonly minVisibleCompletionLengthFt = 1000;
  static readonly conductorSize = '30';
  static readonly casingSize = '9 5/8';
  static readonly linerSize = '7';
  static readonly openHoleSize = '8 1/2';
  static readonly wellName = 'JLMN-843';

  static casing(overrides: Partial<ICasingIR> = {}): ICasingIR {
    return {
      csgSize: this.casingSize,
      csgType: 'Casing',
      csgDepth: this.linerDepthFt,
      csgRemarks: null,
      ...overrides,
    };
  }

  static liner(overrides: Partial<ICasingIR> = {}): ICasingIR {
    return this.casing({
      csgSize: this.linerSize,
      csgType: 'Liner',
      csgDepth: this.linerDepthFt,
      ...overrides,
    });
  }

  static gravelPack(overrides: Partial<ICasingIR> = {}): ICasingIR {
    return this.casing({
      csgSize: '6',
      csgType: 'Gravel Pack',
      csgDepth: 4800,
      ...overrides,
    });
  }

  static drlgCasing(overrides: Partial<IDrlgCsg> = {}): IDrlgCsg {
    return {
      wCsgOdSz: this.casingSize,
      wCsgBotDpth: this.linerDepthFt,
      wLnrOdSz: null,
      wLnrBotDepth: null,
      ...overrides,
    };
  }

  static drillingStatus(overrides: Partial<IDrillingOperationStatus> = {}): IDrillingOperationStatus {
    return {
      epANum: 1001,
      wPrsntDpth: this.plannedTargetDepthFt,
      wCsgBotDpth: this.linerDepthFt,
      wCsgOdSz: this.casingSize,
      wDpthChgDis: 26,
      wMudCircPc: '100',
      wPrevDpth: 4974,
      wSpudOprDay: 25,
      wOpRmk: 'Operation summary',
      nxt24HrPlanRmk: 'Next operation',
      spuddays: 25,
      footage: 26,
      targetDepth: this.plannedTargetDepthFt,
      ...overrides,
    };
  }

  static plannedTop(overrides: Partial<ITopsIR> = {}): ITopsIR {
    return {
      stLongCd: 'TWLF',
      planTvdDepth: this.currentDepthBeyondTargetFt,
      planSsDepth: this.currentDepthBeyondTargetFt,
      ...overrides,
    };
  }

  static actualTop(overrides: Partial<IFormationTops> = {}): IFormationTops {
    return {
      epANum: 1001,
      stLongCd: 'QASR',
      wStDmrkDpth: 3140,
      wStDmrkRmk: null,
      ...overrides,
    };
  }

  static preWellData(overrides: Partial<IPreWellData> = {}): IPreWellData {
    return {
      surfaceElevation: 0,
      estTargetDepth: this.plannedTargetDepthFt,
      targetFormation: 'TWLF',
      supportedBusiness: 'BI1514',
      ...overrides,
    };
  }

  static wellDesign(overrides: Partial<IWellDesign> = {}): IWellDesign {
    return {
      name: this.wellName,
      prewapSeq: 1001,
      staWaterLvl: null,
      swLvlTxt: null,
      pumpLvl: null,
      ohFlg: 'Y',
      ohRemarks: this.openHoleSize,
      gpFlg: null,
      gpRemarks: null,
      perforatedFlg: null,
      perforatedRemarks: null,
      lsFlg: null,
      lsRemarks: null,
      ...overrides,
    };
  }

  static layout(overrides: Partial<DiagramLayout> = {}): DiagramLayout {
    return {
      ...DIAGRAM_LAYOUT,
      ...overrides,
    };
  }

  static diagramData(overrides: Partial<WellboreDiagramData> = {}): WellboreDiagramData {
    return {
      wellName: this.wellName,
      totalDepth: this.plannedTargetDepthFt,
      displayDepth: this.plannedTargetDepthFt + this.displayDepthPaddingFt,
      casings: [this.liner()],
      drlgCasings: [this.drlgCasing({
        wCsgOdSz: '13 3/8',
        wCsgBotDpth: 2020,
        wLnrOdSz: this.linerSize,
        wLnrBotDepth: this.linerDepthFt,
      })],
      geologicTops: [],
      hydrogeology: null,
      prewap: this.preWellData(),
      rigActivity: null,
      currentDepth: this.plannedTargetDepthFt,
      mudCirculation: [],
      wellDesign: this.wellDesign(),
      ...overrides,
    };
  }

  static wellData(overrides: Partial<IWellData> = {}): IWellData {
    return {
      RIG_ACTIVITY: [],
      WELL_MASTER: [],
      RIG_IDENTIFICATION: [],
      CONTACT: [],
      DRLG_OP_STATUS: [this.drillingStatus()],
      DRLG_FM_TOPS: [],
      DRLG_FD_TDAY: [],
      ROP_DATA: [],
      NEXT_2_WELL_ACTIVITY: [],
      NEW_TARGET_DAYS: [],
      DRLG_OP_SMRY: [],
      BITINFO: [],
      EXAD_GWD_IR_HEADER: [],
      EXAD_GWD_IR_TOPS: [],
      EXAD_GWD_IR_CASING: [],
      EXAD_GWD_IR_HYDROGEOLOGY: [],
      EXAD_GWD_IR_WATER: [],
      EXAD_RCD_PREWAP: [this.preWellData()],
      WATER_WELL_TEST_OUTCOME: [],
      EXAD_GWD_WELL_TESTS: [],
      EXAD_GWD_WELL_DESIGN: [],
      EXAD_GWD_DAILY_REMARKS: [],
      MUD_CIRC: [],
      DRLG_CSG: [],
      PRIMARY_HOLEID: [],
      ...overrides,
    };
  }
}
