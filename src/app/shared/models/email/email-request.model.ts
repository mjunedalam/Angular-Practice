import { MorningReport } from "src/app/core/models/morning-report/morning-report.model";
import { WaterWellTestEmailResult } from "../wwell/wwell-test-result.model";

export interface MorningReportTemplateData {
  morningReport: MorningReport[];
  mapImageData: string;
  waterWellTestResults?: WaterWellTestEmailResult[];
  mrReportDate: string;
}

/** A ready-made email (templateName 'plain'): the HTML body plus any PDFs, no report template. */
export interface PlainEmailTemplateData {
  content: string;
  attachments: { filename: string; contentType: string; b64: string }[];
}

export interface EmailRequest {
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  templateData: MorningReportTemplateData | PlainEmailTemplateData;
  generatePdf: boolean;
  templateName: string;
}
