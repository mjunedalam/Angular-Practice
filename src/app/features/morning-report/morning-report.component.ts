import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

import { EmailStore } from 'src/app/core/store/email/email.store';
import { MorningReportStore } from 'src/app/core/store/morning-report/morning-report';
import { EmailService } from '../../core/services/email/email.service';
import { WwellmapComponent } from '../wwell-map/wwell-map.component';

@Component({
  selector: 'app-morningreport',
  standalone: true,
  imports: [
    WwellmapComponent,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
  ],
  templateUrl: './morning-report.component.html',
  styleUrl: './morning-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MorningReportComponent implements OnInit {
  @ViewChild('wwellMap') protected wwellMap!: WwellmapComponent;

  protected readonly store = inject(MorningReportStore);
  private emailStore = inject(EmailStore);
  private emailService = inject(EmailService);

  protected readonly morningReport = this.store.morningReport;
  protected readonly hasError = this.store.hasError;
  protected readonly errorMessage = this.store.errorMessage;
  protected readonly waterWelltestResult = this.store.waterWelltestResult;
  protected readonly statusCode = this.store.statusCode;
  protected readonly loading = this.store.loading;
  protected readonly waterWellTestResultsLoading = this.store.waterWellTestResultsLoading;
  protected readonly isLoadingState = computed(
    () => this.loading() || this.waterWellTestResultsLoading(),
  );
  protected readonly skeletonCards = [1, 2, 3];
  protected readonly skeletonLines = [1, 2, 3, 4];

  ngOnInit(): void {
    this.store.loadMorningReportData();
    this.store.loadWaterWellTestResults();
  }

  protected async sendEmail(): Promise<void> {
    try {
      const morningReport = this.morningReport();
      const mapData = await this.wwellMap.captureMapAsBase64();
      const waterWelltestResults = this.waterWelltestResult();
      const emailRequest = this.emailService.buildEmailRequest(morningReport, mapData!, waterWelltestResults);
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
