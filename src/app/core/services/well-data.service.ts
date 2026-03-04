import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MorningReport, WellName } from '../models/well-name.model';
import { WellDetails, WellDetailsResponse } from '../models/well-details.model';
import { IWellData } from 'src/app/shared/models/wwell/wwell-data.model';
import { APiResponse } from 'src/app/shared/models/wwell/api-response.model';

@Injectable({ providedIn: 'root' })
export class WellDataService {
  [x: string]: any;

  private readonly http = inject(HttpClient);
   apiUrl = "";
  /** Fetches the list of well names for chip rendering. */
  getWellNames(): Observable<WellName[]> {
    return this.http.get<WellName[]>('/assets/data/well-names.json');
  }

  /**
   * Fetches well design data for the given EPA number.
   * Replace the static asset path with your real API endpoint:
   *   return this.http.get<WellDetailsResponse>(`/api/wells/${epANum}/details`)
   *              .pipe(map(res => res.data[0]));
   */
  getWellDetails(epANum: number): Observable<IWellData> {
    void epANum;
    return this.http
      .get<APiResponse<IWellData>>('/assets/data/well-details.json')
      .pipe(map((res) => res.data[0]));
  }

  /** Fetches the morning report to extract dynamic well names. */
  getMorningReport(): Observable<MorningReport[]> {
    return this.http.get<MorningReport[]>(`${this.apiUrl}/morning-report`).pipe(
      map(reports => reports.map(report => ({
        ...report,
        plLtrlEndDpth: report.plLtrlEndDpth ? Number(report.plLtrlEndDpth) : null,
        wDpthChgDis: report.wDpthChgDis ? Number(report.wDpthChgDis) : null,
        wPrsntDpth: report.wPrsntDpth ? Number(report.wPrsntDpth) : null
      })))
    );
  }
}
