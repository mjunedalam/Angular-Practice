import { IWellData } from '@models/well-design/well-data.model';

import {
    removeRigStatusOverride,
    removeWellData,
    resolveSelectionAfterDataLoad,
    updateRigStatusOverrides,
    upsertWellData,
} from './drilling-data.state';
import { selectMorningReports } from './drilling-data.selectors';

function createWellData(epANum: number, wellName = `Well ${epANum}`): IWellData {
    return {
        RIG_ACTIVITY: [{ wellName } as never],
        WELL_MASTER: [],
        RIG_IDENTIFICATION: [],
        CONTACT: [],
        DRLG_OP_STATUS: [{ epANum } as never],
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
        EXAD_RCD_PREWAP: [],
        WATER_WELL_TEST_OUTCOME: [],
    };
}

describe('drilling-data.state helpers', () => {
    it('stores rig status overrides by epANum and clears them when empty', () => {
        const withOverride = updateRigStatusOverrides({}, '1001', 'Running');

        expect(withOverride).toEqual({ 1001: 'Running' });
        expect(selectMorningReports([createWellData(1001)], withOverride)[0]?.rigStatus).toBe('Running');

        const cleared = updateRigStatusOverrides(withOverride, 1001, '   ');

        expect(cleared).toEqual({});
    });

    it('keeps rig status overrides attached to the same well after reordering', () => {
        const overrides = updateRigStatusOverrides({}, 2002, 'Standby');
        const reports = selectMorningReports(
            [createWellData(2002, 'Bravo'), createWellData(1001, 'Alpha')],
            overrides,
        );

        expect(reports[0]?.epANum).toBe('2002');
        expect(reports[0]?.rigStatus).toBe('Standby');
        expect(reports[1]?.rigStatus).toBe('');
    });

    it('resolves the correct page for a selected well after data load', () => {
        const wells = [1001, 1002, 1003, 1004, 1005, 1006].map(epANum => createWellData(epANum));

        const selection = resolveSelectionAfterDataLoad(wells, 1006, { autoSelectFirst: true });

        expect(selection).toEqual({
            selectedEpANum: 1006,
            wellNamesPage: 1,
        });
    });

    it('upserts an existing well by epANum', () => {
        const original = [createWellData(1001, 'Alpha')];
        const updated = upsertWellData(original, createWellData(1001, 'Alpha Prime'));

        expect(updated).toHaveLength(1);
        expect(updated[0]?.RIG_ACTIVITY[0]?.wellName).toBe('Alpha Prime');
    });

    it('removes a well and its rig status override by epANum', () => {
        const original = [createWellData(1001), createWellData(2002)];
        const overrides = updateRigStatusOverrides({}, 2002, 'Paused');

        const nextData = removeWellData(original, 2002);
        const nextOverrides = removeRigStatusOverride(overrides, 2002);

        expect(nextData.map(well => well.DRLG_OP_STATUS[0]?.epANum)).toEqual([1001]);
        expect(nextOverrides).toEqual({});
    });
});
