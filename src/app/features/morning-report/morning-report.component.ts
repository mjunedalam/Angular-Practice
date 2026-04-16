import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { EmailStore } from 'src/app/core/store/email/email.store';
import { MorningReportStore } from 'src/app/core/store/morning-report/morning-report';
import { EmailService } from '@services/email/email.service';
import { WwellmapComponent } from '../wwell-map/wwell-map.component';
import { formatDateForInput } from 'src/app/shared/utils/date.util';

@Component({
  selector: 'app-morningreport',
  standalone: true,
  imports: [
    WwellmapComponent,
    FormsModule,
    MatCardModule,
    MatProgressBarModule,
  ],
  templateUrl: './morning-report.component.html',
  styleUrl: './morning-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MorningReportComponent implements OnInit {
  @ViewChild('wwellMap') protected wwellMap!: WwellmapComponent;

  protected readonly store = inject(MorningReportStore);
  private authStore = inject(AuthStore);
  private emailStore = inject(EmailStore);
  private emailService = inject(EmailService);

  protected readonly morningReport = this.store.morningReport;
  protected readonly hasError = this.store.hasError;
  protected readonly errorMessage = this.store.errorMessage;
  protected readonly waterWelltestResult = this.store.waterWelltestResult;
  protected readonly statusCode = this.store.statusCode;

  protected selectedDateString = formatDateForInput(new Date());

  ngOnInit(): void {
    this.store.loadMorningReportData(this.selectedDateString);
    this.store.loadWaterWellTestResults();
  }

  protected onDateChange(value: string): void {
    if (!value) return;
    this.selectedDateString = value;
    this.store.setDate(value);
  }

  protected async sendEmail(): Promise<void> {
    try {
      const recipientEmail = this.authStore.userEmail();

      if (!recipientEmail) {
        this.showError('Unable to determine the logged-in user email.');
        return;
      }

      const morningReport = this.morningReport();
      const mapData = await this.wwellMap.captureMapAsBase64();
      const waterWelltestResults = this.waterWelltestResult();
      const emailRequest = this.emailService.buildEmailRequest(
        morningReport,
        mapData!,
        recipientEmail,
        waterWelltestResults,
      );
      this.emailStore.sendEmail(emailRequest);

      // this.snackBar.open('Email sent successfully!', 'Dismiss', {
      //   duration: 3000,
      //   panelClass: ['bg-green-500', 'text-white']
      // });

    } catch {
      this.showError('Failed to send email. Please try again.');
    }
  }

  protected downloadReport(): void {
    this.wwellMap.saveMapImage();
  }

  private showError(message: string): void {
    this.store.setUiError(message);
    console.error(message);
  }
}
