import { inject, Injectable } from '@angular/core';
import { EmailRequest } from 'src/app/shared/models/email/email-request.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MorningReport } from '@models/morning-report/morning-report.model';
import { EMAIL_SUBJECT, EMAIL_TEMPLATE_NAME } from 'src/app/shared/models/config/email.config';
import { WaterWellTestResult } from 'src/app/shared/models/wwell/wwell-test-result.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private extConfigService = inject(ExternalConfigService);
  private http = inject(HttpClient);
  private apiUrl = `${this.extConfigService.settings.emailServiceUrl}` + "/send-email";


  sendEmail(emailRequest: EmailRequest): Observable<number> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, emailRequest, { headers, responseType: 'text', observe: 'response' }).pipe(
      map(res => res.status)
    );
  }

  buildEmailRequest(
    reports: MorningReport[],
    mapImageData: string,
    recipientEmail: string,
    waterWellTestResults?: WaterWellTestResult[],
  ): EmailRequest {
    return {
      subject: EMAIL_SUBJECT,
      from: recipientEmail,
      to: [recipientEmail],
      cc: [recipientEmail],
      bcc: [recipientEmail],
      replyTo: '',
      templateName: EMAIL_TEMPLATE_NAME,
      generatePdf: false,
      templateData: {
        morningReport: reports,
        mapImageData: mapImageData,
        waterWellTestResults
      }
    };
  }
}
