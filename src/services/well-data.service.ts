import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { MorningReport } from '../models/morning-report.model';
import { WellName } from '../models/well-design/well-name.model';
import { IWellData } from '../models/well-design/well-data.model';
import { APiResponse } from '../shared/models/wwell/api-response.model';

@Injectable({ providedIn: 'root' })
export class WellDataService {
  private readonly http = inject(HttpClient);
  apiUrl = "";
  /** Fetches the list of well names for chip rendering. */
  getWellNames(): Observable<WellName[]> {
    return this.http.get<WellName[]>('/assets/data/well-names.json');
  }

  /**
   * Fetches well design data for the given EPA number and optional date.
   *
   * @param epANum - The EPA number of the well
   * @param date - Optional date for which to load data; defaults to today
   *
   * Loads date-specific JSON variants from /assets/data/well-details-{YYYYMMDD}.json.
   * Falls back to baseline (20260401) if the date file is not found.
   */
  getWellDetails(epANum: number, date?: Date): Observable<IWellData> {
    const queryDate = date || new Date();
    const dateStr = this.formatDateForAsset(queryDate);
    const assetPath = `/assets/data/well-details-${dateStr}.json`;

    return this.http
      .get<APiResponse<IWellData>>(assetPath)
      .pipe(
        map((res) => res.data[0]),
        catchError(() => {
          // Fallback to baseline if date variant not found
          return this.http
            .get<APiResponse<IWellData>>('/assets/data/well-details-20260401.json')
            .pipe(
              map((res) => res.data[0])
            );
        })
      );
  }

  /**
   * Formats a date to YYYYMMDD string for asset path construction.
   *
   * @param date - The date to format
   * @returns Date string in YYYYMMDD format (e.g., '20260410')
   */
  private formatDateForAsset(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
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
