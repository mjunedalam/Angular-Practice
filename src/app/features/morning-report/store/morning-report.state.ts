import { IWellData } from '@models/well-design/well-data.model';
import { WwellEntry } from '@models/daily-operation/wwell-entry.model';
import { WellFetchFailure } from '@models/morning-report/morning-report.model';
import { DEFAULT_NOTIFICATION_DURATION_MS } from '@shared/components/notification/notification.service';
import { getTodayAtMidnight } from 'src/app/shared/utils/date.util';

export interface MorningReportStoreState {
    readonly wellList: WwellEntry[];
    readonly allWellsData: IWellData[];
    readonly failedWells: readonly WellFetchFailure[];
    readonly selectedDate: Date;
    readonly listLoading: boolean;
    readonly detailLoading: boolean;
    readonly error: string | null;
    readonly notificationDurationMs: number;
}

export const initialMorningReportState: MorningReportStoreState = {
    wellList: [],
    allWellsData: [],
    failedWells: [],
    selectedDate: getTodayAtMidnight(),
    listLoading: false,
    detailLoading: false,
    error: null,
    notificationDurationMs: DEFAULT_NOTIFICATION_DURATION_MS,
};
