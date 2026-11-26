import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { WldaCreatePayload, WldaCreateResult, WldaLetter, WldaPrewap, WldaUpdatePayload } from '@models/wwell-planning/wlda.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

/** An exad_rcd_prewap row as `GET /prewaps` returns it (`select a.*`, column names camel-cased; an empty column can be
 *  missing). Only the columns WLDA reads are listed. */
interface WldaPrewapRow {
  readonly prewapSeq: number;
  readonly wPrimHid?: string | null;
  readonly wNum?: string | null;
  readonly wellType?: string | null;
  readonly tdMd?: number | null;
  readonly targetForm?: string | null;
  readonly gospAreaPlant?: string | null;
  readonly svUtmZn?: number | null;
  readonly surfacen?: number | null;
  readonly surfacee?: number | null;
}

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
   * Every pre-well plan, for the "Link to Water Well" dropdown: `GET /prewaps`
   * (EXAD_AGWA_QUERIES_PKG.get_prewap_data_prc, docs/wlda/get_prewap_data_prc.sql).
   */
  getPrewaps(): Observable<WldaPrewap[]> {
    return this.http.get<ApiResponse<WldaPrewapRow>>(`${this.apiUrl}/prewaps`).pipe(map(res => res.data.map(toPrewap)));
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

function toPrewap(row: WldaPrewapRow): WldaPrewap {
  return {
    prewapSeq: row.prewapSeq,
    wPrimHid: row.wPrimHid ?? null,
    wNum: row.wNum ?? null,
    wellType: row.wellType ?? null,
    tdMd: row.tdMd ?? null,
    targetForm: row.targetForm ?? null,
    gospAreaPlant: row.gospAreaPlant ?? null,
    svUtmZn: row.svUtmZn ?? null,
    surfaceNorth: row.surfacen ?? null,
    surfaceEast: row.surfacee ?? null,
  };
}
