import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { WldaCreatePayload, WldaCreateResult, WldaLetter, WldaPrewap, WldaUpdatePayload } from '@models/wwell-planning/wlda.model';
import { IrEligibleWell } from '../wwell-ir/wwell-ir-form/wwell-ir-payload.model';
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

  /**
   * The wells the "Link to Water Well" dropdown offers: the same `GET /wells/eligible-for-ir` list the IR wizard's
   * "Link to Request" picker uses, reshaped into the plan fields a letter is created from. That endpoint has no
   * GOSP column, so GOSP stays blank.
   */
  getPrewaps(): Observable<WldaPrewap[]> {
    return this.http.get<ApiResponse<IrEligibleWell>>(`${this.apiUrl}/wells/eligible-for-ir`).pipe(map(res => res.data.map(toPrewap)));
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

function toPrewap(well: IrEligibleWell): WldaPrewap {
  const zone = Number.parseInt(well.utmZone ?? '', 10);
  return {
    prewapSeq: well.prewapSeq,
    wPrimHid: well.primaryHoleId,
    wNum: well.wellNumber,
    wellType: well.wellType,
    tdMd: well.targetDepth,
    targetForm: well.targetAquifer,
    gospAreaPlant: null,
    svUtmZn: Number.isNaN(zone) ? null : zone,
    surfaceNorth: well.surfaceNorth,
    surfaceEast: well.surfaceEast,
  };
}
