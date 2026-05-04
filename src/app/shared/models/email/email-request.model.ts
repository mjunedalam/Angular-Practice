import { MorningReport } from "src/app/core/models/morning-report/morning-report.model";
import { WaterWellTestResult } from "../wwell/wwell-test-result.model";

export interface EmailRequest {
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  templateData: {
    morningReport: MorningReport[];
    mapImageData: string;
    waterWellTestResults?: WaterWellTestResult[];
  };
  generatePdf: boolean;
  templateName: string;
}