import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';

import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { EmailStore } from 'src/app/core/store/email/email.store';
import { EmailService } from '@services/email/email.service';
import { DEFAULT_NOTIFICATION_DURATION_MS, NotificationService } from '@shared/components/notification/notification.service';
import { WwellmapComponent } from '../wwell-map/wwell-map.component';
import { blockFutureDigits, clampDateDigits, formatDateForInput, getTodayAtMidnight, parseDateFromInput, validateDateInput } from 'src/app/shared/utils/date.util';
import { MorningReportStore } from './store/morning-report.store';
import { WwellTestViewModel } from '@models/active-wwell/active-wwell-view.model';
import { WaterWellTestEmailResult } from '@shared/models/wwell/wwell-test-result.model';

const MORNING_REPORT_NOTIFICATION_DURATION_MS = 12000;

type WwellTestReportViewModel = WwellTestViewModel & { readonly wellName: string };

interface TestMetricCell {
  readonly label: string;
  readonly value: number | string | null | undefined;
}

type TestMetricRow = readonly [TestMetricCell, TestMetricCell?];

@Component({
  selector: 'app-morningreport',
  standalone: true,
  imports: [
    WwellmapComponent,
    FormsModule,
    MatProgressBarModule,
  ],
  templateUrl: './morning-report.component.html',
  styleUrl: './morning-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MorningReportComponent implements OnInit, OnDestroy {
  @ViewChild('wwellMap') protected wwellMap!: WwellmapComponent;
  @ViewChild('nativeDateInput') private nativeDateInput?: ElementRef<HTMLInputElement>;

  protected readonly store = inject(MorningReportStore);
  private readonly authStore = inject(AuthStore);
  private readonly emailStore = inject(EmailStore);
  protected readonly isSendingEmail = this.emailStore.isSending;
  private readonly emailService = inject(EmailService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly morningReport = this.store.morningReport;
  protected readonly hasError = this.store.hasError;
  protected readonly errorMessage = this.store.errorMessage;
  protected readonly wwellTestViewModels = this.store.wwellTestViewModels;
  protected readonly statusCode = this.store.statusCode;
  protected readonly pageMessage = computed(() => {
    if (this.hasError() || this.store.isLoading()) {
      return null;
    }

    return this.morningReport().length === 0
      ? (this.hasDateQueryParam() ? 'Data is not available for this date' : 'Data is not available for the given date')
      : null;
  });

  protected readonly maxDateString = formatDateForInput(getTodayAtMidnight());
  protected selectedDateString = this.maxDateString;
  protected readonly loadingVisible = signal(false);

  private readonly urlSyncReady = signal(false);
  private readonly hasDateQueryParam = signal(false);
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;
  private loadingShownAt = 0;

  constructor() {
    effect(() => {
      const isLoading = this.store.isLoading();
      if (isLoading) {
        this.clearLoadingTimer();
        this.loadingShownAt = Date.now();
        this.loadingVisible.set(true);
        return;
      }
      if (!this.loadingVisible()) return;
      const elapsed = Date.now() - this.loadingShownAt;
      const remaining = Math.max(0, 380 - elapsed);
      this.clearLoadingTimer();
      this.loadingTimer = setTimeout(() => {
        this.loadingVisible.set(false);
        this.loadingTimer = null;
      }, remaining);
    }, { injector: this.injector });

    effect(() => {
      if (this.emailStore.isSent()) {
        this.notificationService.info('Email sent successfully.');
        this.emailStore.reset();
      } else if (this.emailStore.hasFailed()) {
        this.notificationService.error(this.emailStore.error() ?? 'Failed to send email.');
        this.emailStore.reset();
      }
    }, { injector: this.injector });

    effect(() => {
      if (!this.urlSyncReady()) {
        return;
      }

      const date = formatDateForInput(this.store.selectedDate());

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { date },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }, { injector: this.injector });
  }

  ngOnInit(): void {
    this.store.setNotificationDuration(MORNING_REPORT_NOTIFICATION_DURATION_MS);

    this.applyDateFromQueryParams(this.route.snapshot.queryParamMap, true);
    this.urlSyncReady.set(true);

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.applyDateFromQueryParams(params));

    this.store.loadWaterWellTestResults();
  }

  ngOnDestroy(): void {
    this.store.setNotificationDuration(DEFAULT_NOTIFICATION_DURATION_MS);
    this.clearLoadingTimer();
  }

  private clearLoadingTimer(): void {
    if (this.loadingTimer !== null) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }
  }

  protected onDateInputChange(value: string): void {
    this.commitDate(value);
  }

  protected onDateAutoFormat(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selStart = input.selectionStart ?? 0;
    const rawVal = input.value;

    const rawDigits = rawVal.replace(/\D/g, '').slice(0, 8);
    const endsWithHyphen = rawVal.trimEnd().endsWith('-');

    const paddedDigits = (endsWithHyphen && rawDigits.length === 5)
      ? rawDigits.slice(0, 4) + '0' + rawDigits[4]
      : rawDigits;

    const { digits, isFuture } = blockFutureDigits(clampDateDigits(paddedDigits));

    if (isFuture) {
      this.notificationService.error('Future dates are not allowed');
    }

    let formatted = digits;
    if (digits.length >= 5) formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    if (digits.length >= 7) formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);

    const trailingHyphen = endsWithHyphen && !isFuture && (digits.length === 4 || digits.length === 6);
    if (trailingHyphen) formatted += '-';

    const oldDashes = (rawVal.slice(0, selStart).match(/-/g) ?? []).length;
    const newDashes = (formatted.slice(0, selStart).match(/-/g) ?? []).length;
    const newCursor = trailingHyphen
      ? formatted.length
      : Math.min(selStart + (newDashes - oldDashes), formatted.length);

    input.value = formatted;
    input.setSelectionRange(newCursor, newCursor);

    if (digits.length === 8) {
      this.commitDate(formatted);
    }
  }

  protected onDateTextCommit(value: string): void {
    this.commitDate(value);
  }

  protected openNativePicker(): void {
    this.nativeDateInput?.nativeElement.showPicker?.();
  }

  private commitDate(value: string): void {
    let digits = clampDateDigits(value.trim().replace(/\D/g, '').slice(0, 8));

    if (digits.length < 6) return;

    if (digits.length === 6) digits += '01';
    else if (digits.length === 7) digits = digits.slice(0, 6) + '0' + digits[6];

    const normalized = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;

    const error = validateDateInput(normalized);
    if (error === 'invalid') { this.notificationService.error('Invalid date — use YYYY-MM-DD format'); return; }
    if (error === 'future')  { this.notificationService.error('Future dates are not allowed'); return; }

    const newStr = formatDateForInput(parseDateFromInput(normalized));
    if (newStr === this.selectedDateString) return;

    this.selectedDateString = newStr;
    this.hasDateQueryParam.set(true);
    this.urlSyncReady.set(true);
    this.store.setDate(newStr);
  }

  protected openConfirmDialog(): void {
    const recipientEmail = this.authStore.userEmail();

    if (!recipientEmail) {
      this.showError('Unable to determine the logged-in user email.');
      return;
    }

    this.confirmDialog
      .open({
        title: 'Send Daily Report',
        rows: [
          { label: 'Report Date', value: this.selectedDateString },
          { label: 'Recipient',   value: recipientEmail },
        ],
        confirmLabel: 'Send Report',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) {
          this.sendEmail(recipientEmail);
        }
      });
  }

  private async sendEmail(recipientEmail: string): Promise<void> {
    try {
      const morningReport = this.morningReport();
      const mapData = await this.wwellMap.captureDefaultMapAsBase64();
      const waterWelltestResults = this.wwellTestViewModels().map((vm) => this.toEmailWaterTestResult(vm));
      const emailRequest = this.emailService.buildEmailRequest(
        morningReport,
        mapData ?? '',
        recipientEmail,
        waterWelltestResults,
      );
      this.emailStore.sendEmail(emailRequest);
    } catch {
      this.showError('Failed to send email. Please try again.');
    }
  }

  protected testRows(vm: WwellTestReportViewModel): readonly TestMetricRow[] {
    const isFlow = vm.flowType === 'Y' || vm.testType?.toLowerCase() === 'flow';

    if (isFlow) {
      const cells: TestMetricCell[] = [
        { label: 'Aquifer', value: vm.aquiferActual },
        { label: 'Test Duration (h)', value: vm.duration },
      ];
      cells.push(
        { label: 'Test Rate (GPM)', value: vm.rate },
        { label: 'SIWHP (psi)', value: vm.siwhp },
        { label: 'Temperature (°C)', value: vm.temp },
        { label: 'TDS (PPM)', value: vm.tds },
        { label: 'H2S (PPM)', value: vm.h2sActual },
      );
      return this.toMetricRows(cells);
    }

    return [
      [{ label: 'Aquifer', value: vm.aquiferActual }, { label: 'Test Rate (GPM)', value: vm.rate }],
      [{ label: 'RPM', value: vm.rpm }, { label: 'H2S (PPM)', value: vm.h2sActual }],
      [{ label: 'Temperature (°C)', value: vm.temp }, { label: 'Well Productivity (GPM/FT)', value: vm.productivityActual }],
      [{ label: 'TDS (PPM)', value: vm.tds }],
    ];
  }

  private toMetricRows(cells: readonly TestMetricCell[]): readonly TestMetricRow[] {
    const rows: TestMetricRow[] = [];
    for (let i = 0; i < cells.length; i += 2) {
      const next = cells[i + 1];
      if (!next && rows.length > 0) {
        rows[rows.length - 1] = [rows[rows.length - 1][0], cells[i]];
        break;
      }
      rows.push([cells[i], next]);
    }
    return rows;
  }

  protected get displayDate(): string {
    const d = parseDateFromInput(this.selectedDateString);
    if (isNaN(d.getTime())) return this.selectedDateString;
    return d.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).replace(',', '');
  }

  protected hasMetricValue(value: number | string | null | undefined): boolean {
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  protected isFlowTestVm(vm: WwellTestReportViewModel): boolean {
    return vm.flowType === 'Y' || vm.testType?.toLowerCase() === 'flow';
  }

  private testTypeLabel(vm: WwellTestReportViewModel): 'FLOW' | 'PUMP' {
    return this.isFlowTestVm(vm) ? 'FLOW' : 'PUMP';
  }

  private toEmailWaterTestResult(vm: WwellTestReportViewModel): WaterWellTestEmailResult {
    const testType = this.testTypeLabel(vm);
    return {
      testType,
      wellName: vm.wellName,
      rPM: testType === 'PUMP' ? this.metricText(vm.rpm) : '',
      siwhp: testType === 'FLOW' ? this.metricText(vm.siwhp) : '',
      fwhp: testType === 'FLOW' ? this.metricText(vm.fwhp) : '',
      pumpDepth: testType === 'PUMP' ? this.metricText(vm.hydPmpDpth) : '',
      swl: testType === 'PUMP' ? this.metricText(vm.swl) : '',
      dwl: testType === 'PUMP' ? this.metricText(vm.dwl) : '',
      h2sPPM: this.metricText(vm.h2sActual),
      temperature: this.metricText(vm.temp),
      trgtRsvrCd: this.metricText(vm.aquiferActual),
      duration: this.metricText(vm.duration),
      testRate: this.metricText(vm.rate),
      wellProductivity: this.metricText(vm.productivityActual),
      tds: this.metricText(vm.tds),
      conductedBy: this.metricText(vm.conductedBy),
      rows: this.testRows(vm).map(([left, right]) => ({
        leftLabel: left.label,
        leftValue: this.metricText(left.value),
        rightLabel: right?.label ?? '',
        rightValue: right ? this.metricText(right.value) : '',
      })),
    };
  }

  private metricText(value: number | string | null | undefined): string {
    return this.hasMetricValue(value) ? String(value) : 'Missing';
  }

  private showError(message: string): void {
    this.store.setUiError(message);
  }

  private normalizeDateParam(value: string | null): string {
    if (!value) {
      return this.maxDateString;
    }

    const parsed = parseDateFromInput(value);

    if (Number.isNaN(parsed.getTime()) || parsed > getTodayAtMidnight()) {
      return this.maxDateString;
    }

    return value;
  }

  private applyDateFromQueryParams(params: ParamMap, forceLoad = false): void {
    const requestedDate = this.normalizeDateParam(params.get('date'));
    const currentDate = formatDateForInput(this.store.selectedDate());

    this.selectedDateString = requestedDate;
    this.hasDateQueryParam.set(params.has('date'));

    if (!forceLoad && requestedDate === currentDate) {
      return;
    }

    this.store.loadMorningReportData(requestedDate);
  }
}
