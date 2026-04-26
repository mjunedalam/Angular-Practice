import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { WellDoc } from '@models/well-design/well-docs.model';
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

  uploadDocs(files: File[], epANum: number, date: string): Observable<void> {
    if (!this.apiUrl) {
      return throwError(() => new Error('Well documents service unavailable.'));
    }

    const formData = new FormData();
    formData.append('epANum', String(epANum));
    formData.append('date', date);
    files.forEach(f => formData.append('files', f, f.name));

    return this.http
      .post<void>(`${this.apiUrl}/well-pres-docs/upload`, formData)
      .pipe(timeout(CONNECTION_TIMEOUT_MS));
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
}
