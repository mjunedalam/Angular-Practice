import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WellName } from '../models/well-name.model';
import { WellDetails, WellDetailsResponse } from '../models/well-details.model';

@Injectable({ providedIn: 'root' })
export class WellDataService {
  private readonly http = inject(HttpClient);

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
  getWellDetails(epANum: number): Observable<WellDetails> {
    void epANum;
    return this.http
      .get<WellDetailsResponse>('/assets/data/well-details.json')
      .pipe(map((res) => res.data[0]));
  }
}
