import { IWellData } from '@models/well-design/well-data.model';

let _enabled = false;

export const wellDataValidator = {
  enable: () => { _enabled = true; },
  disable: () => { _enabled = false; },
  get isEnabled() { return _enabled; },
};

type KnownKeys = Partial<Record<keyof IWellData, string[]>>;

const EXPECTED_KEYS: KnownKeys = {
  RIG_ACTIVITY: ['wellName', 'biNum', 'wRigCd', 'spuddate', 'wDrlgLocDesc', 'welltype', 'waterWell', 'wDrlgEndDt', 'wDrlgTrgtDay', 'drlgPlanWellDesc'],
  WELL_MASTER: ['well', 'lat', 'lon'],
  RIG_IDENTIFICATION: ['rigname', 'wRigActStsCd'],
  CONTACT: [],
  DRLG_OP_STATUS: ['epANum', 'wPrsntDpth', 'wCsgBotDpth', 'wCsgOdSz', 'wDpthChgDis', 'wOpRmk', 'wDrlgSmryRmk', 'nxt24HrPlanRmk', 'spuddays', 'footage', 'targetDepth', 'wMudCircPc'],
  DRLG_FM_TOPS: ['stLongCd', 'wStDmrkDpth', 'wStDmrkRmk'],
  DRLG_FD_TDAY: ['footage'],
  ROP_DATA: ['rop'],
  NEXT_2_WELL_ACTIVITY: ['nextWellActivity'],
  NEW_TARGET_DAYS: ['targetDays'],
  DRLG_OP_SMRY: ['wOpRmk', 'wEvntTime', 'wHoleEndDpth', 'wHolSz'],
  BITINFO: ['bitSz'],
  EXAD_GWD_IR_HEADER: ['dtRemarks', 'mudRemarks', 'loggingRemarks'],
  EXAD_GWD_IR_TOPS: ['stLongCd', 'planTvdDepth', 'planSsDepth'],
  EXAD_GWD_IR_CASING: ['csgDepth', 'csgSize', 'csgType', 'csgRemarks'],
  EXAD_GWD_IR_HYDROGEOLOGY: ['estTargetAquifier', 'flowType', 'estH2s', 'estWaterQuality', 'estProductivity', 'estStaticWaterLevel'],
  EXAD_GWD_IR_WATER: ['offsetWaterWell', 'aquifer', 'rpm', 'h2s', 'distance', 'specificCapacity', 'flowRate', 'testDuration', 'staticWaterLevel', 'drawDown', 'fieldTds'],
  EXAD_RCD_PREWAP: ['estTargetDepth', 'targetFormation', 'supportedBusiness'],
  WATER_WELL_TEST_OUTCOME: [],
  EXAD_GWD_WELL_TESTS: ['wellName', 'rsvrCd', 'hydTestTypCd', 'temp', 'hydH2sCnc', 'wtrSaTdsCnc', 'rpm', 'siwhp', 'hydProdRt', 'statWlvl', 'dyncWlvl', 'hydProduct', 'duration'],
  EXAD_GWD_WELL_DESIGN: ['name', 'prewapSeq', 'staWaterLvl', 'swLvlTxt', 'pumpLvl', 'ohFlag', 'ohRemarks', 'gpFlag', 'gpRemarks', 'perforatedFlg', 'perforatedRemarks', 'lsFlag', 'lsRemarks'],
  EXAD_GWD_DAILY_REMARKS: ['status', 'opRmk', 'next24HrPlanRrmk', 'drlgSmryRmk'],
  MUD_CIRC: ['wPrsntDpth', 'wMudCircPc', 'wDpthChgDis'],
};

interface ValidationRow {
  Status: 'Missing' | 'Empty';
  Level: 'first' | 'second';
  Key: string;
  Field: string;
}

export function validateWellData(data: IWellData | null, wellId?: string): void {
  if (!_enabled || !data) return;

  const rows: ValidationRow[] = [];

  for (const key of Object.keys(EXPECTED_KEYS) as (keyof IWellData)[]) {
    const value = data[key as keyof IWellData];

    if (!(key in data) || value == null) {
      rows.push({ Status: 'Missing', Level: 'first', Key: key, Field: '—' });
      continue;
    }

    if (Array.isArray(value) && value.length === 0) {
      rows.push({ Status: 'Empty', Level: 'first', Key: key, Field: '—' });
      continue;
    }

    const expectedFields = EXPECTED_KEYS[key];
    if (!expectedFields?.length) continue;

    const arr = value as unknown[];
    const item = arr[0] as Record<string, unknown>;
    for (const field of expectedFields) {
      if (!(field in item)) {
        rows.push({ Status: 'Missing', Level: 'second', Key: key, Field: field });
      }
    }
  }

  if (!rows.length) return;

  const label = wellId ? `WellDataValidator [well: ${wellId}]` : 'WellDataValidator';
  console.group(label);
  console.table(rows);
  console.groupEnd();
}
