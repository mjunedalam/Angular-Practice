import { IWellData } from '@models/well-design/well-data.model';
import { WwellEntry } from '@models/daily-operation/wwell-entry.model';
import { getTodayAtMidnight } from 'src/app/shared/utils/date.util';

export interface PresentationState {
    readonly wellList: WwellEntry[];
    readonly selectedEpANum: number | null;
    readonly selectedDate: Date;
    readonly wellData: IWellData | null;
    readonly listLoading: boolean;
    readonly detailLoading: boolean;
    readonly error: string | null;
    readonly animationTrigger: number;
    readonly wellNamesPage: number;
}

export const initialPresentationState: PresentationState = {
    wellList: [],
    selectedEpANum: null,
    selectedDate: getTodayAtMidnight(),
    wellData: null,
    listLoading: false,
    detailLoading: false,
    error: null,
    animationTrigger: 0,
    wellNamesPage: 0,
};
