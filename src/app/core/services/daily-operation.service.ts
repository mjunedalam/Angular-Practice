import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IWellData } from '@models/well-design/well-data.model';
import { WwellEntry } from '@models/daily-operation/wwell-entry.model';
import { Aquifer } from '@models/daily-operation/aquifer.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

@Injectable({ providedIn: 'root' })
export class DailyOperationService {
    private readonly http = inject(HttpClient);
    private readonly extConfigService = inject(ExternalConfigService);

    private get apiUrl(): string {
        const serverUrl = this.extConfigService.settings.dailyOperationServiceUrl ?? '';
        return `${serverUrl}/daily-operations/api/v1`;
    }

    getWellList(date: string): Observable<WwellEntry[]> {
        return this.http
            .get<ApiResponse<WwellEntry>>(`${this.apiUrl}/wwells/entry?date=${date}`)
            .pipe(map(res => res.data));
    }

    getWellDetail(date: string, epANum: number): Observable<IWellData> {
        return this.http
            .get<ApiResponse<IWellData>>(`${this.apiUrl}/wwells?date=${date}&epANum=${epANum}`)
            .pipe(map(res => res.data[0]));
    }

    getAquifers(): Observable<Aquifer[]> {
        return this.http
            .get<ApiResponse<Aquifer>>(`${this.apiUrl}/aquifers`)
            .pipe(map(res => res.data));
    }
}
