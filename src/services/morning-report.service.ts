import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MorningReport } from '../models/morning-report.model';

@Injectable({
  providedIn: 'root'
})
export class MorningReportService {
  private http = inject(HttpClient);
  //   private apiUrl = `${this.extConfigService.settings.dailyOperatioServicenUrl}`;

  //   getMorningReport(): Observable<MorningReport[]> {
  //     return this.http.get<MorningReport[]>(`${this.apiUrl}/morning-report`).pipe(
  //       map(reports => reports.map(report => ({
  //         ...report,
  //         plLtrlEndDpth: report.plLtrlEndDpth ? Number(report.plLtrlEndDpth) : null,
  //         wDpthChgDis: report.wDpthChgDis ? Number(report.wDpthChgDis) : null,
  //         wPrsntDpth: report.wPrsntDpth ? Number(report.wPrsntDpth) : null
  //       })))
  //     );
  //   }

  //   getWaterWellTestResultData(): Observable<ApiResponse<WaterWellTestResult>> {
  //     return this.http.get<ApiResponse<WaterWellTestResult>>(this.apiUrl + "/morning-report/waterWellTestResults");
  //   }

  /*
   This method is for testing and validation of map content and will be eliminated after integration testing is done.
   Reason behind to create a temporary method:-  Test data received from the upstream does not have relavent co-orindates for KSA. 
   So, we have to manipulate the data to have the co-ordinates confined only to KSA. 
  */

  getMorningReport(): Observable<MorningReport[]> {
    return this.http.get<MorningReport[]>('assets/data/mr-report.json').pipe(
      map(reports => reports.map(report => ({
        ...report,
        plLtrlEndDpth: report.plLtrlEndDpth ? Number(report.plLtrlEndDpth) : null,
        wDpthChgDis: report.wDpthChgDis ? Number(report.wDpthChgDis) : null,
        wPrsntDpth: report.wPrsntDpth ? Number(report.wPrsntDpth) : null
      })))
    );

  }

}
