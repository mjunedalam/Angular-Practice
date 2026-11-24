import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { WldaCreatePayload, WldaCreateResult, WldaLetter, WldaPrewap, WldaUpdatePayload } from '@models/wwell-planning/wlda.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

/** agwa-planning's WLDA letter endpoints. Attachments are not here — they go to the S3 service. */
@Injectable({ providedIn: 'root' })
export class WldaService {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);

  private get apiUrl(): string {
    const serverUrl = this.extConfigService.settings.planningServiceUrl ?? '';
    return `${serverUrl}/planning/api/v1`;
  }

  /** Every pre-well plan — the plan a new letter is created under. */
  getPrewaps(): Observable<WldaPrewap[]> {
    return this.http.get<ApiResponse<WldaPrewap>>(`${this.apiUrl}/prewaps`).pipe(map(res => res.data));
  }

  /** Every letter of every plan. */
  getLetters(): Observable<WldaLetter[]> {
    return this.http.get<ApiResponse<WldaLetter>>(`${this.apiUrl}/wlda-letters`).pipe(map(res => res.data));
  }

  /** One letter (get_wlda_letters_prc with both prewap and letter id), fresh from the database. */
  getLetter(prewapSeq: number, ltrId: number): Observable<WldaLetter> {
    return this.http
      .get<ApiResponse<WldaLetter>>(`${this.apiUrl}/prewaps/${prewapSeq}/wlda-letters/${ltrId}`)
      .pipe(map(res => res.data[0]));
  }

  createLetter(prewapSeq: number, payload: WldaCreatePayload): Observable<WldaCreateResult> {
    return this.http
      .post<ApiResponse<WldaCreateResult>>(`${this.apiUrl}/prewaps/${prewapSeq}/wlda-letters`, payload)
      .pipe(map(res => res.data[0]));
  }

  updateLetter(prewapSeq: number, ltrId: number, payload: WldaUpdatePayload): Observable<WldaCreateResult> {
    return this.http
      .put<ApiResponse<WldaCreateResult>>(`${this.apiUrl}/prewaps/${prewapSeq}/wlda-letters/${ltrId}`, payload)
      .pipe(map(res => res.data[0]));
  }

  deleteLetter(prewapSeq: number, ltrId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/prewaps/${prewapSeq}/wlda-letters/${ltrId}`);
  }
}
