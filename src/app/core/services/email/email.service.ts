import { inject, Injectable } from '@angular/core';
import { EmailRequest } from 'src/app/shared/models/email/email-request.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MorningReport } from '@models/morning-report/morning-report.model';
import { EMAIL_PLAIN_TEMPLATE_NAME, EMAIL_SUBJECT, EMAIL_TEMPLATE_NAME } from 'src/app/shared/models/config/email.config';
import { WaterWellTestEmailResult } from 'src/app/shared/models/wwell/wwell-test-result.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private extConfigService = inject(ExternalConfigService);
  private http = inject(HttpClient);
  private apiUrl = `${this.extConfigService.settings.emailServiceUrl}` + "/send-email";


  private formatReportDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dd = String(date.getDate()).padStart(2, '0');
    return `${days[date.getDay()]} ${dd} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

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
    waterWellTestResults?: WaterWellTestEmailResult[],
    reportDate?: string,
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
        waterWellTestResults,
        mrReportDate: this.formatReportDate(reportDate ?? new Date().toISOString().slice(0, 10))
      }
    };
  }

  /** The approved-IR email: sent by and to the logged-in user, CC from EXAD_DHUB_LKUP_DATA, the PDF attached.
   *  The backend wraps `content` in the morning report's header/footer shell; `details` become a table in the same style. */
  buildIrApprovedEmailRequest(
    recipientEmail: string,
    cc: string[],
    label: string,
    fileName: string,
    pdfBase64: string,
    details: readonly { readonly label: string; readonly value: string }[] = [],
  ): EmailRequest {
    const escape = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cell = 'border:1px solid #c0c0c0; padding:6px 10px; font-size:12px; text-align:left;';
    const rows = details
      .map(
        row =>
          `<tr><td style="${cell} background-color:#ddeaf7; color:#003d99; font-weight:700; width:35%;">${escape(row.label)}</td>` +
          `<td style="${cell} color:#111827;">${escape(row.value || '—')}</td></tr>`,
      )
      .join('');
    const table = rows
      ? `<table style="border-collapse:collapse; width:100%; margin:12px 0;"><tr><td colspan="2" style="${cell} background-color:#d0cece; color:#8b0000; font-weight:700; font-size:14px; text-align:center;">INTEGRATED REQUIREMENT</td></tr>${rows}</table>`
      : '';
    return {
      subject: `Approved Integrated Requirements - ${label}`,
      from: recipientEmail,
      to: [recipientEmail],
      cc,
      replyTo: '',
      templateName: EMAIL_PLAIN_TEMPLATE_NAME,
      generatePdf: false,
      templateData: {
        title: 'Approved Integrated Requirements',
        content:
          `<p style="margin:0 0 8px;">Please find below the approved Integrated Requirements for <b>${escape(label)}</b>. ` +
          `The signed letter is attached as a PDF.</p>${table}`,
        attachments: [{ filename: fileName, contentType: 'application/pdf', b64: pdfBase64 }],
      },
    };
  }
}
