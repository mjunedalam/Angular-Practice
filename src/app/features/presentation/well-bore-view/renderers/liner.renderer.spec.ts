import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { resolveLastCasingShoe } from './liner.renderer';

describe('resolveLastCasingShoe', () => {
    it('uses the deepest casing shoe even when that same row also carries a liner (IDrlgCsg bundles both)', () => {
        // No IR casing program (casings=[]) — as-drilled-only well, matching the reported bug:
        // the 13 3/8" casing row also carries the 9 5/8" liner hung off it (wLnrOdSz etc.),
        // which must NOT disqualify its own wCsgBotDpth as the deepest casing shoe.
        const drlgCasings: IDrlgCsg[] = [
            { wCsgOdSz: '24', wCsgBotDpth: 133 },
            { wCsgOdSz: '18 5/8', wCsgBotDpth: 1041 },
            { wCsgOdSz: '13 3/8', wCsgBotDpth: 4772, wLnrOdSz: '9 5/8', wLnrTopDepth: 1992, wLnrBotDepth: 7138 },
        ];

        expect(resolveLastCasingShoe([], drlgCasings)).toBe(4772);
    });

    it('still picks the deepest shoe when no row carries liner info', () => {
        const drlgCasings: IDrlgCsg[] = [
            { wCsgOdSz: '24', wCsgBotDpth: 133 },
            { wCsgOdSz: '18 5/8', wCsgBotDpth: 1041 },
        ];

        expect(resolveLastCasingShoe([], drlgCasings)).toBe(1041);
    });
});
