import { IWellData } from '@models/well-design/well-data.model';
import { WwellEntry } from '@models/daily-operation/wwell-entry.model';
import { RigStatusOverrides } from 'src/app/core/store/shared/well-data.state';
import { DEFAULT_NOTIFICATION_DURATION_MS } from '@shared/components/notification/notification.service';
import { getTodayAtMidnight } from 'src/app/shared/utils/date.util';

export interface MorningReportStoreState {
    readonly wellList: WwellEntry[];
    readonly allWellsData: IWellData[];
    readonly selectedDate: Date;
    readonly listLoading: boolean;
    readonly detailLoading: boolean;
    readonly error: string | null;
    readonly rigStatusOverrides: RigStatusOverrides;
    readonly notificationDurationMs: number;
}

export const initialMorningReportState: MorningReportStoreState = {
    wellList: [],
    allWellsData: [],
    selectedDate: getTodayAtMidnight(),
    listLoading: false,
    detailLoading: false,
    error: null,
    rigStatusOverrides: {},
    notificationDurationMs: DEFAULT_NOTIFICATION_DURATION_MS,
};
