import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { GridApi } from 'ag-grid-community';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { skip } from 'rxjs';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import { watch as reactiveWatch } from '@arcgis/core/core/reactiveUtils';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllWellRow,
  StatusGroupRow,
  StatusStat,
  STATUS_COLORS,
  allWellColumnDefs,
  allWellsGridOptions,
  allWellsGridTheme,
  legendItems,
  statusGroupColumnDefs,
  statusGroupGridOptions,
  statusGroupGridTheme,
} from './water-wells-overview.config';
import { IWellData } from '@models/well-design/well-data.model';
import { MorningReportStore } from '../morning-report/store/morning-report.store';
import { LoaderService } from 'src/app/shared/components/global-loader/loader.service';
import {
  lineSymbol,
  locationTextSymbol,
  MAP_CONFIG,
  resolveBiColor,
  STYLE,
  WWell,
  wwellIdTextSymbol,
} from 'src/app/shared/models/config/agwa-map.config';
import { findNonOverlappingPosition } from 'src/app/shared/utils/wwell-placement-utils';
import { EsriMapService } from '@core/services/esri-map.service';       // office: OAuth auth
import { ExternalConfigService } from '@shared/services/external-config.service'; // office: portal config
import { NotificationService } from '@shared/components/notification/notification.service';
import {
  blockFutureDigits,
  clampDateDigits,
  formatDateForInput,
  getTodayAtMidnight,
  parseDateFromInput,
  validateDateInput,
} from 'src/app/shared/utils/date.util';


const BOOT_TASK = 'arcgis-map-overview';


@Component({
  selector: 'app-water-wells-overview',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './water-wells-overview.component.html',
  styleUrl: './water-wells-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterWellsOverviewComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl?: ElementRef<HTMLDivElement>;
  @ViewChild('mapPanel') private mapPanelEl?: ElementRef<HTMLElement>;
  @ViewChild('legendPanel') private legendPanelEl?: ElementRef<HTMLElement>;
  @ViewChild('allWellsPanel') private allWellsPanelEl?: ElementRef<HTMLElement>;
  @ViewChild('nativeDateInput') private nativeDateInput?: ElementRef<HTMLInputElement>;

  private mapView?: __esri.MapView;
  private wwellLayer?: GraphicsLayer;
  private bubbleLayer?: GraphicsLayer;
  private stationaryWatchHandle?: __esri.WatchHandle;
  private placedBubbles: { x: number; y: number; radius: number }[] = [];
  private readonly bubbleLayerReady = signal<GraphicsLayer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ksaExtent?: any;
  private bootTaskRegistered = false;
  private mapRetryTimeoutId?: ReturnType<typeof setTimeout>;
  private intersectionObserver?: IntersectionObserver;
  private isDestroyed = false;

  private readonly MAP_TIMEOUT_MS = 20_000;
  private readonly MAX_RETRY_DELAY_MS = 30_000;

  // ── Map zoom levels — tweak these to control the viewport ─────────────────
  private readonly INITIAL_ZOOM = 6;             // starting zoom on map load
  // goTo() supports fractional zoom — MapView.zoom property snaps to integers,
  // but goTo target { zoom } is continuous and actually renders the in-between level.
  private readonly FULLSCREEN_ENTER_ZOOM = 6.5;  // ~one half-step tighter in fullscreen
  // ──────────────────────────────────────────────────────────────────────────

  // ── Well drawing animation — tweak to adjust speed / drama ────────────────
  private readonly DRAW_STAGGER_MS = 80;         // ms between each dot birth
  private readonly DOT_START_SIZE = 2;           // initial dot size (px)
  private readonly DOT_FINAL_SIZE = 8;          // final dot size (px)
  // Total ms from birth → full size. Linear grow + fade-in alpha.
  // rAF loop keeps animation synced to browser repaint so every frame renders.
  private readonly DOT_GROW_DURATION_MS = 700;
  // ──────────────────────────────────────────────────────────────────────────

  private pulseIntervalId?: ReturnType<typeof setInterval>;

  protected readonly mapReady = signal(false);
  protected readonly isFullscreen = signal(false);
  protected readonly isDrawingWells = signal(false);

  // Legend — drag
  protected readonly isLegendDragging = signal(false);
  protected readonly legendX = signal<number | null>(null);
  protected readonly legendY = signal<number | null>(null);
  private legendOffsetX = 0;
  private legendOffsetY = 0;

  // All Wells panel — drag + minimize
  protected readonly isAllWellsDragging = signal(false);
  protected readonly allWellsX = signal<number | null>(null);
  protected readonly allWellsY = signal<number | null>(null);
  private allWellsOffsetX = 0;
  private allWellsOffsetY = 0;
  protected readonly isAllWellsMinimized = signal(false);
  private allWellsGridApi: GridApi | null = null;

  private readonly wwells = signal<WWell[]>([]);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly loader = inject(LoaderService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostEl = inject(ElementRef);
  private readonly notificationService = inject(NotificationService);
  protected readonly store = inject(MorningReportStore);
  private readonly esriAuth = inject(EsriMapService);          // office: OAuth auth
  private readonly extConfigService = inject(ExternalConfigService); // office: portal config

  protected readonly maxDateString = formatDateForInput(getTodayAtMidnight());
  protected selectedDateString = this.maxDateString;

  private toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  protected readonly statusStats = computed((): StatusStat[] => {
    const counts = new Map<string, number>();
    for (const d of this.store.allWellsData()) {
      const raw = d.EXAD_GWD_DAILY_REMARKS?.[0]?.status?.trim();
      if (!raw) continue;
      const status = this.toTitleCase(raw);
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([status, count], i) => ({ status, count, color: STATUS_COLORS[i % STATUS_COLORS.length] }))
      .sort((a, b) => b.count - a.count);
  });

  protected readonly statusGroupRows = computed((): StatusGroupRow[] => {
    const groups = new Map<string, string[]>();
    for (const d of this.store.allWellsData()) {
      const raw = d.EXAD_GWD_DAILY_REMARKS?.[0]?.status?.trim();
      if (!raw) continue;
      const status = this.toTitleCase(raw);
      const wellName = d.RIG_ACTIVITY?.[0]?.wellName ?? 'N/A';
      if (!groups.has(status)) groups.set(status, []);
      groups.get(status)!.push(wellName);
    }
    return Array.from(groups.entries())
      .map(([status, names], i) => ({
        status,
        count: names.length,
        wellNames: names.join('\n'),
        color: STATUS_COLORS[i % STATUS_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  });

  protected readonly totalWells = computed(() => this.store.allWellsData().length);

  protected readonly allWellRows = computed((): AllWellRow[] =>
    this.store.allWellsData().map((d) => {
      const raw = d.EXAD_GWD_DAILY_REMARKS?.[0]?.status?.trim();
      return {
        rigName: d.RIG_IDENTIFICATION?.[0]?.rigname ?? d.RIG_ACTIVITY?.[0]?.wRigCd ?? 'N/A',
        wellName: d.RIG_ACTIVITY?.[0]?.wellName ?? 'N/A',
        targetAquifer: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0]?.estTargetAquifier ?? 'N/A',
        status: raw ? this.toTitleCase(raw) : '—',
      };
    })
  );

  protected readonly columnDefs = statusGroupColumnDefs;
  protected readonly allWellColumnDefs = allWellColumnDefs;
  readonly gridTheme = statusGroupGridTheme;
  readonly allWellsTheme = allWellsGridTheme;
  readonly gridOptions = statusGroupGridOptions;
  readonly allWellsGridOptions = allWellsGridOptions;
  protected readonly legendItems = legendItems;

  protected onAllWellsGridReady(api: GridApi): void {
    this.allWellsGridApi = api;
    api.sizeColumnsToFit();
  }

  protected toggleAllWellsMinimized(): void {
    this.isAllWellsMinimized.update(v => !v);
    // After expanding, let the layout settle then size columns to fill the panel
    if (!this.isAllWellsMinimized()) {
      setTimeout(() => this.allWellsGridApi?.sizeColumnsToFit(), 50);
    }
  }

  constructor() {
    effect(() => {
      this.buildWwells(this.store.allWellsData());
    });

    effect(() => {
      this.wwells();
      if (!this.mapReady() || !this.wwellLayer) return;
      void this.drawWwells(this.wwellLayer);
    });

    effect(() => {
      this.wwells();
      const layer = this.bubbleLayerReady();
      if (!layer) return;
      this.layoutBubbles(layer);
    });
  }

  protected goBack(): void {
    void this.router.navigate(['/main/presentations'], {
      queryParams: { date: this.selectedDateString },
    });
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
    this.store.setDate(newStr);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date: newStr },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private normalizeDateParam(value: string | null): string {
    if (!value) return this.maxDateString;
    const parsed = parseDateFromInput(value);
    if (Number.isNaN(parsed.getTime()) || parsed > getTodayAtMidnight()) return this.maxDateString;
    return value;
  }

  private applyDateFromQueryParams(params: ParamMap, forceLoad = false): void {
    const requestedDate = this.normalizeDateParam(params.get('date'));
    const currentDate = formatDateForInput(this.store.selectedDate());
    this.selectedDateString = requestedDate;
    if (!forceLoad && requestedDate === currentDate) return;
    this.store.loadMorningReportData(requestedDate);
  }

  protected toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      const mainEl = (this.hostEl.nativeElement as HTMLElement).closest('main') as HTMLElement | null;
      (mainEl ?? (this.hostEl.nativeElement as HTMLElement)).requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen();
    }
  }

  protected onLegendDragStart(event: MouseEvent): void {
    const panel = this.legendPanelEl?.nativeElement;
    const parent = this.mapPanelEl?.nativeElement;
    if (!panel || !parent) return;

    const rect = panel.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    if (this.legendX() === null) {
      this.legendX.set(rect.left - parentRect.left);
      this.legendY.set(rect.top - parentRect.top);
    }

    this.isLegendDragging.set(true);
    this.legendOffsetX = event.clientX - rect.left;
    this.legendOffsetY = event.clientY - rect.top;
    event.preventDefault();
  }

  protected onAllWellsDragStart(event: MouseEvent): void {
    const panel = this.allWellsPanelEl?.nativeElement;
    const parent = this.mapPanelEl?.nativeElement;
    if (!panel || !parent) return;

    const rect = panel.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    if (this.allWellsX() === null) {
      this.allWellsX.set(rect.left - parentRect.left);
      this.allWellsY.set(rect.top - parentRect.top);
    }

    this.isAllWellsDragging.set(true);
    this.allWellsOffsetX = event.clientX - rect.left;
    this.allWellsOffsetY = event.clientY - rect.top;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  protected onDocumentMouseMove(event: MouseEvent): void {
    if (this.isLegendDragging()) {
      const parent = this.mapPanelEl?.nativeElement;
      const panel = this.legendPanelEl?.nativeElement;
      if (parent && panel) {
        const parentRect = parent.getBoundingClientRect();
        this.legendX.set(Math.max(0, Math.min(
          event.clientX - parentRect.left - this.legendOffsetX,
          parentRect.width - panel.offsetWidth,
        )));
        this.legendY.set(Math.max(0, Math.min(
          event.clientY - parentRect.top - this.legendOffsetY,
          parentRect.height - panel.offsetHeight,
        )));
      }
    }

    if (this.isAllWellsDragging()) {
      const parent = this.mapPanelEl?.nativeElement;
      const panel = this.allWellsPanelEl?.nativeElement;
      if (parent && panel) {
        const parentRect = parent.getBoundingClientRect();
        this.allWellsX.set(Math.max(0, Math.min(
          event.clientX - parentRect.left - this.allWellsOffsetX,
          parentRect.width - panel.offsetWidth,
        )));
        this.allWellsY.set(Math.max(0, Math.min(
          event.clientY - parentRect.top - this.allWellsOffsetY,
          parentRect.height - panel.offsetHeight,
        )));
      }
    }

  }

  @HostListener('document:mouseup')
  protected onDocumentMouseUp(): void {
    this.isLegendDragging.set(false);
    this.isAllWellsDragging.set(false);
  }

  @HostListener('document:fullscreenchange')
  protected onFullscreenChange(): void {
    const entering = !!document.fullscreenElement;
    this.isFullscreen.set(entering);
    // Wait for browser fullscreen transition (~400ms) before repositioning.
    // Use mapView.center so the view stays on the user's current pan position.
    setTimeout(() => {
      if (!this.mapView) return;
      const target = this.ksaExtent
        ? this.ksaExtent.expand(entering ? 0.72 : 1.05)
        : { center: this.mapView.center, zoom: entering ? this.FULLSCREEN_ENTER_ZOOM : this.INITIAL_ZOOM };
      void this.mapView.goTo(target, { duration: 700, animate: true });
    }, 450);
  }

  ngOnInit(): void {
    this.isFullscreen.set(!!document.fullscreenElement);
    if (!isPlatformBrowser(this.platformId)) return;
    this.applyDateFromQueryParams(this.route.snapshot.queryParamMap, true);
    this.route.queryParamMap
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(params => this.applyDateFromQueryParams(params));
    this.observeVisibility();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    clearTimeout(this.mapRetryTimeoutId);
    this.stopPulseAnimation();
    this.intersectionObserver?.disconnect();
    this.stationaryWatchHandle?.remove();
    this.mapView?.destroy();
    this.resolveBootTask();
  }

  private observeVisibility(): void {
    const el = this.mapViewEl?.nativeElement;
    if (!el || !('IntersectionObserver' in window)) {
      this.registerBootTask();
      this.initMapWithRetry();
      return;
    }
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.intersectionObserver?.disconnect();
          this.intersectionObserver = undefined;
          this.registerBootTask();
          this.initMapWithRetry();
        }
      },
      { threshold: 0.1 },
    );
    this.intersectionObserver.observe(el);
  }

  private initMapWithRetry(attempt = 0): void {
    this.initMap().catch(() => {
      if (this.isDestroyed) return;
      const delay = Math.min(1000 * Math.pow(2, attempt), this.MAX_RETRY_DELAY_MS);
      this.mapRetryTimeoutId = setTimeout(() => this.initMapWithRetry(attempt + 1), delay);
    });
  }

  private async initMap(): Promise<void> {
    this.mapView?.destroy();
    this.mapView = undefined;
    this.wwellLayer = undefined;
    this.bubbleLayerReady.set(null);
    this.mapReady.set(false);

    // ── Office (authenticated portal WebMap) ──────────────────────────────
    await this.esriAuth.authenticateUserForMapAccess();
    const webMap = new WebMap({
      portalItem: { id: this.extConfigService.settings.morningReportWebMapId },
    });
    this.mapView = new MapView({
      container: this.mapViewEl?.nativeElement,
      map: webMap,
      center: MAP_CONFIG.center,
      zoom: this.INITIAL_ZOOM,
      ui: { components: [] },
    });
    await Promise.race([
      this.mapView.when(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Map timed out')), this.MAP_TIMEOUT_MS),
      ),
    ]);
    // ─────────────────────────────────────────────────────────────────────

    // Non-animated snap to correct position (hidden behind spinner)
    this.mapView.zoom = this.INITIAL_ZOOM;
    this.mapView.center = { longitude: MAP_CONFIG.center[0], latitude: MAP_CONFIG.center[1] } as __esri.Point;

    this.wwellLayer = new GraphicsLayer({ id: 'wwo-dots' });
    this.bubbleLayer = new GraphicsLayer({ id: 'wwo-bubbles' });
    webMap.addMany([this.wwellLayer, this.bubbleLayer]);

    this.mapReady.set(true);
    this.bubbleLayerReady.set(this.bubbleLayer);
    await this.waitForMapRender();
    this.resolveBootTask();

    this.stationaryWatchHandle = reactiveWatch(
      () => this.mapView?.stationary,
      (isStationary) => {
        if (isStationary && this.bubbleLayer) this.layoutBubbles(this.bubbleLayer);
      },
    );
  }

  private async waitForMapRender(): Promise<void> {
    if (!this.mapView) return;
    if (!this.mapView.updating) { await new Promise(requestAnimationFrame); return; }
    await new Promise<void>((resolve) => {
      const handle = reactiveWatch(
        () => this.mapView?.updating ?? false,
        (updating) => { if (!updating) { handle.remove(); requestAnimationFrame(() => resolve()); } },
      );
    });
  }

  private buildWwells(data: IWellData[]): void {
    const wells: WWell[] = data.flatMap((d) => {
      const master = d.WELL_MASTER?.[0];
      const rig = d.RIG_ACTIVITY?.[0];
      const lat = master?.lat;
      const lng = master?.lon;
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) return [];
      const hydro = d.EXAD_GWD_IR_HYDROGEOLOGY?.[0];
      const prewap = d.EXAD_RCD_PREWAP?.[0];
      return [{
        wwellId: rig?.wellName ?? 'N/A',
        lat: lat!,
        lng: lng!,
        location: hydro?.estTargetAquifier ?? prewap?.targetFormation ?? 'N/A',
        label: rig?.biNum ?? 'N/A',
      }];
    });
    this.wwells.set(wells);
  }

  private async drawWwells(dotsLayer: GraphicsLayer): Promise<void> {
    this.stopPulseAnimation();
    this.isDrawingWells.set(true);
    dotsLayer.removeAll();

    const wells = this.wwells();
    if (wells.length === 0) { this.isDrawingWells.set(false); return; }

    const { default: SimpleMarkerSymbol } = await import('@arcgis/core/symbols/SimpleMarkerSymbol');

    // Add all dots to the layer upfront (invisible, alpha=0).
    // rAF loop then animates each one in with a staggered birth time so the
    // browser paint cycle drives every frame — setTimeout-based updates get
    // batched by ArcGIS and most intermediate sizes never render.
    interface DotAnim { graphic: Graphic; birthTime: number; r: number; g: number; b: number; }
    const anims: DotAnim[] = [];
    const startTime = performance.now();

    for (let i = 0; i < wells.length; i++) {
      const wwell = wells[i];
      const [r, g, b] = resolveBiColor(wwell.label);
      const graphic = new Graphic({
        geometry: new Point({ latitude: wwell.lat, longitude: wwell.lng }),
        symbol: new SimpleMarkerSymbol({ style: 'circle', size: this.DOT_START_SIZE, color: [r, g, b, 0], outline: { width: 0 } }),
      });
      dotsLayer.add(graphic);
      anims.push({ graphic, birthTime: startTime + i * this.DRAW_STAGGER_MS, r, g, b });
    }

    // Run until every dot has finished its grow + fade-in
    await new Promise<void>((resolve) => {
      const tick = () => {
        if (this.isDestroyed) { resolve(); return; }
        const now = performance.now();
        let anyPending = false;

        for (const dot of anims) {
          const elapsed = now - dot.birthTime;
          if (elapsed < 0) { anyPending = true; continue; }
          if (elapsed >= this.DOT_GROW_DURATION_MS) continue;

          const t = elapsed / this.DOT_GROW_DURATION_MS;
          const size = this.DOT_START_SIZE + (this.DOT_FINAL_SIZE - this.DOT_START_SIZE) * t;
          dot.graphic.symbol = new SimpleMarkerSymbol({
            style: 'circle', size, color: [dot.r, dot.g, dot.b, t],
            outline: { width: 0 },
          });
          anyPending = true;
        }

        if (anyPending) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });

    // Snap all dots to final state so none are left partially grown
    if (!this.isDestroyed) {
      for (const dot of anims) {
        dot.graphic.symbol = new SimpleMarkerSymbol({
          style: 'circle', size: this.DOT_FINAL_SIZE, color: [dot.r, dot.g, dot.b, 1],
          outline: { width: 0 },
        });
      }
    }

    this.isDrawingWells.set(false);
    this.startPulseAnimation(dotsLayer);
  }

  private startPulseAnimation(layer: GraphicsLayer): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (layer as any).effect = null;
  }

  private stopPulseAnimation(): void {
    if (this.pulseIntervalId !== undefined) {
      clearInterval(this.pulseIntervalId);
      this.pulseIntervalId = undefined;
    }
  }

  private geoDegreesPerPixel(view: __esri.MapView): { x: number; y: number } {
    const cx = view.width / 2, cy = view.height / 2;
    const p0 = view.toMap({ x: cx, y: cy });
    const px = view.toMap({ x: cx + 10, y: cy });
    const py = view.toMap({ x: cx, y: cy + 10 });
    return {
      x: p0 && px ? Math.abs((px.longitude ?? 0) - (p0.longitude ?? 0)) / 10 : 0.001,
      y: p0 && py ? Math.abs((py.latitude ?? 0) - (p0.latitude ?? 0)) / 10 : 0.001,
    };
  }

  private layoutBubbles(layer: GraphicsLayer): void {
    if (!this.mapView) return;
    layer.removeAll();
    this.placedBubbles = [];

    const view = this.mapView;
    const viewW = view.width;
    const viewH = view.height;

    const { x: degX, y: degY } = this.geoDegreesPerPixel(view);
    const topPxW = 90, topPxH = 20, botPxW = 72, botPxH = 20;
    const halfTopW = (topPxW / 2) * degX;
    const topH = topPxH * degY;
    const halfBotW = (botPxW / 2) * degX;
    const botH = botPxH * degY;

    const bubblePixelRadius = Math.max(STYLE.squareSize / 2, 20) + 8;
    const iconRadius = STYLE.markerSize / 2;
    const margin = bubblePixelRadius + 4;
    const graphics: Graphic[] = [];
    const anchorPt = new Point({ latitude: 0, longitude: 0, spatialReference: { wkid: 4326 } });

    for (const wwell of this.wwells()) {
      anchorPt.latitude = wwell.lat;
      anchorPt.longitude = wwell.lng;

      const sp = view.toScreen(anchorPt);
      if (!sp) continue;

      sp.x = Math.max(8, Math.min(viewW - 8, sp.x));
      sp.y = Math.max(8, Math.min(viewH - 8, sp.y));

      const obstacles = [...this.placedBubbles, { x: sp.x, y: sp.y, radius: iconRadius + 6 }];
      const finalScreen = findNonOverlappingPosition(sp.x, sp.y, obstacles, bubblePixelRadius);

      finalScreen.x = Math.max(margin, Math.min(viewW - margin, finalScreen.x));
      finalScreen.y = Math.max(margin, Math.min(viewH - margin, finalScreen.y));

      this.placedBubbles.push({ x: finalScreen.x, y: finalScreen.y, radius: bubblePixelRadius });

      let anchor = view.toMap(finalScreen) as __esri.Point | null;
      if (!anchor) anchor = anchorPt.clone();
      const cx = anchor.longitude!;
      const cy = anchor.latitude!;

      graphics.push(new Graphic({
        geometry: new Polyline({
          paths: [[[wwell.lng, wwell.lat], [cx, cy + topH / 2]]],
          spatialReference: { wkid: 4326 },
        }),
        symbol: lineSymbol(resolveBiColor(wwell.label)),
      }));

      graphics.push(new Graphic({
        geometry: new Polygon({
          rings: [[[cx - halfTopW, cy + topH], [cx + halfTopW, cy + topH],
          [cx + halfTopW, cy], [cx - halfTopW, cy], [cx - halfTopW, cy + topH]]],
          spatialReference: { wkid: 4326 },
        }),
        symbol: new SimpleFillSymbol({
          color: resolveBiColor(wwell.label),
          outline: { color: [0, 0, 0], width: 1 },
        }),
      }));

      graphics.push(new Graphic({
        geometry: new Polygon({
          rings: [[[cx - halfBotW, cy], [cx + halfBotW, cy],
          [cx + halfBotW, cy - botH], [cx - halfBotW, cy - botH], [cx - halfBotW, cy]]],
          spatialReference: { wkid: 4326 },
        }),
        symbol: new SimpleFillSymbol({ color: [0, 191, 255, 0.9], outline: { color: [0, 0, 0], width: 1 } }),
      }));

      const topCenter = new Point({ longitude: cx, latitude: cy + topH / 2, spatialReference: { wkid: 4326 } });
      const wwellIdLabel = new Graphic({ geometry: topCenter, symbol: wwellIdTextSymbol(STYLE.textFont) });
      (wwellIdLabel.symbol as TextSymbol).text = wwell.wwellId;
      (wwellIdLabel.symbol as TextSymbol).verticalAlignment = 'middle';
      (wwellIdLabel.symbol as TextSymbol).horizontalAlignment = 'center';
      (wwellIdLabel.symbol as TextSymbol).yoffset = 0;

      const botCenter = new Point({ longitude: cx, latitude: cy - botH / 2, spatialReference: { wkid: 4326 } });
      const locationLabel = new Graphic({ geometry: botCenter, symbol: locationTextSymbol(STYLE.textFont) });
      (locationLabel.symbol as TextSymbol).text = wwell.location;
      (locationLabel.symbol as TextSymbol).horizontalAlignment = 'center';
      (locationLabel.symbol as TextSymbol).verticalAlignment = 'middle';
      (locationLabel.symbol as TextSymbol).yoffset = 0;

      graphics.push(wwellIdLabel, locationLabel);
    }
    layer.addMany(graphics);
  }

  

  private registerBootTask(): void {
    if (this.bootTaskRegistered) return;
    this.bootTaskRegistered = true;
    this.loader.registerBootTask(BOOT_TASK);
  }

  private resolveBootTask(): void {
    if (!this.bootTaskRegistered) return;
    this.bootTaskRegistered = false;
    this.loader.resolveBootTask(BOOT_TASK);
  }
}