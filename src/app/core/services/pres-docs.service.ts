import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, throwError, timeout } from 'rxjs';
import { WellDoc } from '@models/well-design/well-docs.model';
import { DocListResponse, UploadDocResponse } from '@shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

const CONNECTION_TIMEOUT_MS = 5000;

@Injectable({ providedIn: 'root' })
export class PresDocsService {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);

  private get apiUrl(): string {
    try {
      return this.extConfigService.settings.presDocsServiceUrl ?? '';
    } catch {
      return '';
    }
  }

  uploadDocs(files: File[], epANum: number, uploadDate: string): Observable<UploadDocResponse[]> {
    if (!this.apiUrl) {
      return throwError(() => new Error('Well documents service unavailable.'));
    }

    const requests = files.map(file => {
      const params = new HttpParams()
        .set('epaNum', String(epANum))
        .set('uploadDate', uploadDate);

      const formData = new FormData();
      formData.append('wellFile', file, file.name);

      return this.http
        .post<UploadDocResponse>(`${this.apiUrl}/welldocuments/well-presentation-docs`, formData, { params })
        .pipe(timeout(CONNECTION_TIMEOUT_MS));
    });

    return forkJoin(requests);
  }

  getDocs(epANum: number, date: string): Observable<WellDoc[]> {
    if (!this.apiUrl) {
      return throwError(() => new Error('Well documents service unavailable.'));
    }

    const params = new HttpParams()
      .set('epANum', epANum)
      .set('date', date);

    return this.http
      .get<WellDoc[]>(`${this.apiUrl}/well-pres-docs`, { params })
      .pipe(timeout(CONNECTION_TIMEOUT_MS));
  }

  getDocList(epaNum: number, uploadDate: string): Observable<DocListResponse> {
    if (!this.apiUrl) {
      return throwError(() => new Error('Well documents service unavailable.'));
    }

    const params = new HttpParams()
      .set('epaNum', String(epaNum))
      .set('uploadDate', uploadDate);

    return this.http
      .get<DocListResponse>(`${this.apiUrl}/welldocuments/well-presentation-docs-list`, { params })
      .pipe(timeout(CONNECTION_TIMEOUT_MS));
  }

  fetchDoc(docName: string, epaNum: number, uploadDate: string): Observable<Blob> {
    if (!this.apiUrl) {
      return throwError(() => new Error('Well documents service unavailable.'));
    }

    const params = new HttpParams()
      .set('docName', docName)
      .set('epaNum', String(epaNum))
      .set('uploadDate', uploadDate);

    return this.http
      .get(`${this.apiUrl}/welldocuments/well-presentation-docs`, { params, responseType: 'blob' })
      .pipe(timeout(CONNECTION_TIMEOUT_MS));
  }
}
