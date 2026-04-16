import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WellDoc } from 'src/app/core/models/well-design/well-docs.model';

@Injectable({ providedIn: 'root' })
export class WellDocsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/well-docs';

  getDocsByWellAndDate(wellName: string, date: string): Observable<WellDoc[]> {
    const params = new HttpParams()
      .set('wellName', wellName)
      .set('date', date);
    return this.http.get<WellDoc[]>(this.baseUrl, { params });
  }
}
