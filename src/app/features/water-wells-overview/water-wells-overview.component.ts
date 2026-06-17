import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { Router } from '@angular/router';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
// import ArcGISMap from '@arcgis/core/Map'; // default only
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import WebMap from '@arcgis/core/WebMap'; // office: uses authenticated portal WebMap
import MapView from '@arcgis/core/views/MapView';
import { watch as reactiveWatch } from '@arcgis/core/core/reactiveUtils';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, themeQuartz } from 'ag-grid-community';
import { IWellData } from '@models/well-design/well-data.model';
import { MorningReportStore } from '../morning-report/store/morning-report.store';
import { LoaderService } from 'src/app/shared/components/global-loader/loader.service';
import {
  MAP_CONFIG,
  tilesArray,
  WWell,
} from 'src/app/shared/models/config/agwa-map.config';
import { EsriMapService } from '@core/services/esri-map.service';       // office: OAuth auth
import { ExternalConfigService } from '@shared/services/external-config.service'; // office: portal config
import { formatDateForInput, getTodayAtMidnight } from 'src/app/shared/utils/date.util';

export interface StatusStat {
  status: string;
  count: number;
  color: string;
}

export interface StatusGroupRow {
  status: string;
  count: number;
  wellNames: string;
  color: string;
}

export interface AllWellRow {
  rigName: string;
  wellName: string;
  targetAquifer: string;
  status: string;
}

const STATUS_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#14b8a6',
];

const BOOT_TASK = 'arcgis-map-overview';

const LEGEND_CHIP_COLORS: Record<string, string> = {
  '3300': '#84cc16',
  '58': '#c084fc',
  '1514': '#f87171',
  '60': '#60a5fa',
};

// RGB tuples matching LEGEND_CHIP_COLORS exactly — used for ArcGIS dot rendering
// so map dots always match the legend visually
const LEGEND_DOT_RGB: Record<string, [number, number, number]> = {
  '3300': [132, 204, 22],
  '58':   [192, 132, 252],
  '1514': [248, 113, 113],
  '60':   [96,  165, 250],
};

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
  @ViewChild('allWellsPanel') private allWellsPanelEl?: ElementRef<HTMLElement>;
  @ViewChild('legendPanel') private legendPanelEl?: ElementRef<HTMLElement>;

  private mapView?: __esri.MapView;
  private wwellLayer?: GraphicsLayer;
  private labelsLayer?: GraphicsLayer;
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
  private readonly DRAW_STAGGER_MS = 60;         // ms between each dot birth
  private readonly DOT_START_SIZE = 1;           // initial dot size (px)
  private readonly DOT_FINAL_SIZE = 8;           // final dot size (px)
  // Total ms from birth → full size. Uses ease-out quad + fade-in alpha.
  // rAF loop keeps animation synced to browser repaint so every frame renders.
  private readonly DOT_GROW_DURATION_MS = 500;
  private readonly LABEL_STAGGER_MS = 40;        // ms between each label appearing
  // ──────────────────────────────────────────────────────────────────────────

  private pulseIntervalId?: ReturnType<typeof setInterval>;
  private pulsePhase = 0;

  protected readonly mapReady = signal(false);
  protected readonly isFullscreen = signal(false);
  protected readonly isDrawingWells = signal(false);

  // All Wells panel — drag
  protected readonly isDragging = signal(false);
  protected readonly panelX = signal<number | null>(null);
  protected readonly panelY = signal<number | null>(null);
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // All Wells panel — resize
  protected readonly isResizing = signal(false);
  protected readonly panelWidth = signal<number | null>(null);
  protected readonly panelHeight = signal<number | null>(null);
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartW = 0;
  private resizeStartH = 0;

  // Legend — drag
  protected readonly isLegendDragging = signal(false);
  protected readonly legendX = signal<number | null>(null);
  protected readonly legendY = signal<number | null>(null);
  private legendOffsetX = 0;
  private legendOffsetY = 0;
  private readonly wwells = signal<WWell[]>([]);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly loader = inject(LoaderService);
  private readonly router = inject(Router);
  private readonly hostEl = inject(ElementRef);
  protected readonly store = inject(MorningReportStore);
  private readonly esriAuth = inject(EsriMapService);          // office: OAuth auth
  private readonly extConfigService = inject(ExternalConfigService); // office: portal config

  protected readonly statusStats = computed((): StatusStat[] => {
    const counts = new Map<string, number>();
    for (const d of this.store.allWellsData()) {
      const status = d.EXAD_GWD_DAILY_REMARKS?.[0]?.status?.trim() || 'Unknown';
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([status, count], i) => ({ status, count, color: STATUS_COLORS[i % STATUS_COLORS.length] }))
      .sort((a, b) => b.count - a.count);
  });

  protected readonly statusGroupRows = computed((): StatusGroupRow[] => {
    const groups = new Map<string, string[]>();
    for (const d of this.store.allWellsData()) {
      const status = d.EXAD_GWD_DAILY_REMARKS?.[0]?.status?.trim() || 'Unknown';
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
    this.store.allWellsData().map((d) => ({
      rigName: d.RIG_IDENTIFICATION?.[0]?.rigname ?? d.RIG_ACTIVITY?.[0]?.wRigCd ?? 'N/A',
      wellName: d.RIG_ACTIVITY?.[0]?.wellName ?? 'N/A',
      targetAquifer: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0]?.estTargetAquifier ?? 'N/A',
      status: d.EXAD_GWD_DAILY_REMARKS?.[0]?.status?.trim() ?? 'Unknown',
    }))
  );

  protected readonly columnDefs: ColDef<StatusGroupRow>[] = [
    {
      headerName: 'Status',
      field: 'status',
      flex: 1,
      minWidth: 90,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (p: any) => {
        const color: string = p.data?.color ?? '#60a5fa';
        return `<div style="display:flex;align-items:center;height:100%"><span style="display:inline-flex;align-items:center;gap:4px;padding:2px 9px 2px 6px;border-radius:999px;background:${color}1a;border:1px solid ${color}50;color:${color};font-weight:700;font-size:10px;line-height:1.5;white-space:nowrap"><span style="width:5px;height:5px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block"></span>${p.value ?? ''}</span></div>`;
      },
    },
    {
      headerName: '#',
      field: 'count',
      width: 44,
      maxWidth: 44,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (p: any) =>
        `<div style="display:flex;align-items:center;justify-content:center;height:100%"><span style="display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;border-radius:50%;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-weight:800;font-size:10px">${p.value ?? ''}</span></div>`,
    },
    {
      headerName: 'Wells',
      field: 'wellNames',
      flex: 2,
      minWidth: 80,
      wrapText: true,
      autoHeight: true,
      cellStyle: { lineHeight: '1.6', paddingTop: '6px', paddingBottom: '6px', whiteSpace: 'pre-line', color: '#64748b', fontSize: '10px' },
    },
  ];

  protected readonly allWellColumnDefs: ColDef<AllWellRow>[] = [
    {
      headerName: 'Rig Name',
      field: 'rigName',
      flex: 1,
      minWidth: 60,
      cellStyle: { fontWeight: '600', display: 'flex', alignItems: 'center', fontSize: '10px', color: '#334155' },
    },
    {
      headerName: 'Well Name',
      field: 'wellName',
      flex: 1.2,
      minWidth: 70,
      cellStyle: { fontWeight: '700', color: '#3b82f6', display: 'flex', alignItems: 'center', fontSize: '10px' },
    },
    {
      headerName: 'Target Aquifer',
      field: 'targetAquifer',
      flex: 1.8,
      minWidth: 80,
      wrapText: true,
      autoHeight: true,
      cellStyle: { lineHeight: '1.4', paddingTop: '4px', paddingBottom: '4px', whiteSpace: 'pre-line', fontSize: '9px', color: '#94a3b8' },
    },
  ];

  readonly gridTheme = themeQuartz.withParams({
    accentColor: '#3b82f6',
    backgroundColor: '#ffffff',
    foregroundColor: '#1e293b',
    headerBackgroundColor: '#dbeafe',
    headerTextColor: '#1d4ed8',
    headerFontSize: 10,
    headerFontWeight: 700,
    rowHoverColor: 'rgba(59, 130, 246, 0.07)',
    oddRowBackgroundColor: '#fafbfc',
    borderColor: '#e2e8f0',
    borderRadius: 0,
    fontSize: 11,
    headerHeight: 30,
    spacing: 2,
    fontFamily: 'inherit',
    cellHorizontalPaddingScale: 1.2,
  });

  readonly allWellsGridTheme = themeQuartz.withParams({
    accentColor: '#60a5fa',
    backgroundColor: 'transparent',
    foregroundColor: 'rgba(255,255,255,0.82)',
    headerBackgroundColor: 'rgba(96,165,250,0.08)',
    headerTextColor: 'rgba(96,165,250,0.58)',
    headerFontSize: 9,
    headerFontWeight: 700,
    rowHoverColor: 'rgba(96,165,250,0.12)',
    oddRowBackgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 0,
    fontSize: 10,
    headerHeight: 26,
    spacing: 1.5,
    fontFamily: 'inherit',
    cellHorizontalPaddingScale: 0.9,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly gridOptions: GridOptions<any> = {
    animateRows: true,
    suppressMovableColumns: true,
    suppressCellFocus: true,
    domLayout: 'normal',
    tooltipShowDelay: 300,
    defaultColDef: { sortable: true, filter: false, resizable: true },
    overlayNoRowsTemplate: '<span style="color:#94a3b8;font-size:12px">No data</span>',
    onGridReady: (params) => params.api.sizeColumnsToFit(),
  };

  readonly allWellsGridOptions: GridOptions<AllWellRow> = {
    animateRows: true,
    suppressMovableColumns: true,
    suppressCellFocus: true,
    domLayout: 'autoHeight',
    tooltipShowDelay: 300,
    defaultColDef: { sortable: true, filter: false, resizable: true },
    overlayNoRowsTemplate: '<span style="color:#94a3b8;font-size:12px">No data</span>',
    onGridReady: (params) => params.api.sizeColumnsToFit(),
  };

  protected readonly legendItems = tilesArray.map(t => ({
    biNum: t.biNum,
    color: LEGEND_CHIP_COLORS[t.biNum] ?? `rgb(${t.color[0]}, ${t.color[1]}, ${t.color[2]})`,
  }));

  constructor() {
    effect(() => {
      this.buildWwells(this.store.allWellsData());
    });

    effect(() => {
      this.wwells();
      if (!this.mapReady() || !this.wwellLayer || !this.labelsLayer) return;
      void this.drawWwells(this.wwellLayer, this.labelsLayer);
    });
  }

  protected goBack(): void {
    void this.router.navigate(['/main/presentations']);
  }

  protected toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      (this.hostEl.nativeElement as HTMLElement).requestFullscreen().catch((err: unknown) => {
        console.warn('[WellsOverview] Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  protected onPanelDragStart(event: MouseEvent): void {
    const panel = this.allWellsPanelEl?.nativeElement;
    const parent = this.mapPanelEl?.nativeElement;
    if (!panel || !parent) return;

    const rect = panel.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    if (this.panelX() === null) {
      this.panelX.set(rect.left - parentRect.left);
      this.panelY.set(rect.top - parentRect.top);
    }

    this.isDragging.set(true);
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;
    event.preventDefault();
  }

  protected onResizeStart(event: MouseEvent): void {
    const panel = this.allWellsPanelEl?.nativeElement;
    if (!panel) return;
    this.isResizing.set(true);
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartW = this.panelWidth() ?? panel.offsetWidth;
    this.resizeStartH = this.panelHeight() ?? panel.offsetHeight;
    event.preventDefault();
    event.stopPropagation();
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

  @HostListener('document:mousemove', ['$event'])
  protected onDocumentMouseMove(event: MouseEvent): void {
    if (this.isDragging()) {
      const parent = this.mapPanelEl?.nativeElement;
      const panel = this.allWellsPanelEl?.nativeElement;
      if (parent && panel) {
        const parentRect = parent.getBoundingClientRect();
        this.panelX.set(Math.max(0, Math.min(
          event.clientX - parentRect.left - this.dragOffsetX,
          parentRect.width - panel.offsetWidth,
        )));
        this.panelY.set(Math.max(0, Math.min(
          event.clientY - parentRect.top - this.dragOffsetY,
          parentRect.height - panel.offsetHeight,
        )));
      }
    }

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

    if (this.isResizing()) {
      const parent = this.mapPanelEl?.nativeElement;
      const maxH = parent ? parent.offsetHeight - 20 : 600;
      this.panelWidth.set(Math.max(180, Math.min(this.resizeStartW + event.clientX - this.resizeStartX, 480)));
      this.panelHeight.set(Math.max(140, Math.min(this.resizeStartH + event.clientY - this.resizeStartY, maxH)));
    }
  }

  @HostListener('document:mouseup')
  protected onDocumentMouseUp(): void {
    this.isDragging.set(false);
    this.isLegendDragging.set(false);
    this.isResizing.set(false);
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
    if (!isPlatformBrowser(this.platformId)) return;
    this.store.loadMorningReportData(formatDateForInput(getTodayAtMidnight()));
    this.observeVisibility();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    clearTimeout(this.mapRetryTimeoutId);
    this.stopPulseAnimation();
    this.intersectionObserver?.disconnect();
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
    this.initMap().catch((err: unknown) => {
      if (this.isDestroyed) return;
      const delay = Math.min(1000 * Math.pow(2, attempt), this.MAX_RETRY_DELAY_MS);
      console.warn(`[WellsOverview] Reconnecting… attempt ${attempt + 1}`, err);
      this.mapRetryTimeoutId = setTimeout(() => this.initMapWithRetry(attempt + 1), delay);
    });
  }

  private async initMap(): Promise<void> {
    this.mapView?.destroy();
    this.mapView = undefined;
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
      Promise.all([this.mapView.when(), webMap.load()]),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Map timed out')), this.MAP_TIMEOUT_MS),
      ),
    ]);
    if (webMap.loadStatus === 'failed') throw webMap.loadError ?? new Error('WebMap failed to load');
    this.wwellLayer = new GraphicsLayer({ id: 'overview-wwells' });
    this.labelsLayer = new GraphicsLayer({ id: 'overview-labels' });
    webMap.addMany([this.wwellLayer, this.labelsLayer]);
    // ─────────────────────────────────────────────────────────────────────

    // ── Free public basemap (no auth required) ────────────────────────────
    // this.wwellLayer = new GraphicsLayer({ id: 'overview-wwells' });
    // this.labelsLayer = new GraphicsLayer({ id: 'overview-labels' });
    // const map = new ArcGISMap({ basemap: 'gray-vector', layers: [this.wwellLayer, this.labelsLayer] });
    // this.mapView = new MapView({
    //   container: this.mapViewEl?.nativeElement,
    //   map,
    //   center: MAP_CONFIG.center,
    //   zoom: 5,
    //   ui: { components: [] },
    // });
    // await Promise.race([
    //   this.mapView.when(),
    //   new Promise<never>((_, reject) =>
    //     setTimeout(() => reject(new Error('Map timed out')), this.MAP_TIMEOUT_MS),
    //   ),
    // ]);
    // ─────────────────────────────────────────────────────────────────────

    // Non-animated snap to correct position (hidden behind spinner)
    this.mapView.zoom = this.INITIAL_ZOOM;
    this.mapView.center = { longitude: MAP_CONFIG.center[0], latitude: MAP_CONFIG.center[1] } as __esri.Point;

    // void this.addKsaBoundary(map); // default only — WebMap already has basemap

    // Show map first so user sees the drawing animation (matches active-wwell-map pattern)
    this.mapReady.set(true);
    await this.waitForMapRender();
    this.resolveBootTask();
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

  private async drawWwells(dotsLayer: GraphicsLayer, labelsLayer: GraphicsLayer): Promise<void> {
    this.stopPulseAnimation();
    this.isDrawingWells.set(true);
    dotsLayer.removeAll();
    labelsLayer.removeAll();

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
      const [r, g, b] = LEGEND_DOT_RGB[wwell.label] ?? [160, 160, 160];
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
          const eased = 1 - (1 - t) * (1 - t); // ease-out quad: fast start, soft landing
          const size = this.DOT_START_SIZE + (this.DOT_FINAL_SIZE - this.DOT_START_SIZE) * eased;
          dot.graphic.symbol = new SimpleMarkerSymbol({
            style: 'circle', size, color: [dot.r, dot.g, dot.b, eased], outline: { width: 0 },
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
          style: 'circle', size: this.DOT_FINAL_SIZE, color: [dot.r, dot.g, dot.b, 1], outline: { width: 0 },
        });
      }
    }

    this.isDrawingWells.set(false);
    this.startPulseAnimation(dotsLayer);

    // Stagger labels onto a separate bloom-free layer for readable transition
    for (const wwell of wells) {
      if (this.isDestroyed) break;
      const pt = new Point({ latitude: wwell.lat, longitude: wwell.lng });
      labelsLayer.add(new Graphic({
        geometry: pt,
        symbol: new TextSymbol({
          text: wwell.wwellId,
          color: [20, 20, 20],
          font: { size: 10, weight: 'bold', family: 'sans-serif' },
          horizontalAlignment: 'center',
          verticalAlignment: 'bottom',
          yoffset: 8,
        }),
      }));
      await new Promise<void>(resolve => setTimeout(resolve, this.LABEL_STAGGER_MS));
    }
  }

  private startPulseAnimation(layer: GraphicsLayer): void {
    this.stopPulseAnimation();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const l = layer as any;
    this.pulseIntervalId = setInterval(() => {
      if (this.isDestroyed) { this.stopPulseAnimation(); return; }
      this.pulsePhase = (this.pulsePhase + 0.08) % (Math.PI * 2);
      // Bloom oscillates between ~0.4 and ~1.2 for a clearly visible pulse
      const strength = (0.8 + Math.sin(this.pulsePhase) * 0.4).toFixed(2);
      const blur = (0.4 + Math.sin(this.pulsePhase) * 0.3).toFixed(2);
      l.effect = `bloom(${strength}, ${blur}px, 0)`;
    }, 50);
  }

  private stopPulseAnimation(): void {
    if (this.pulseIntervalId !== undefined) {
      clearInterval(this.pulseIntervalId);
      this.pulseIntervalId = undefined;
    }
  }

  private async addKsaBoundary(map: WebMap): Promise<void> {
    try {
      const [
        { default: FeatureLayer },
        { default: SimpleRenderer },
        { default: SimpleFillSymbol },
      ] = await Promise.all([
        import('@arcgis/core/layers/FeatureLayer'),
        import('@arcgis/core/renderers/SimpleRenderer'),
        import('@arcgis/core/symbols/SimpleFillSymbol'),
      ]);

      const ksaLayer = new FeatureLayer({
        url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer/0',
        definitionExpression: "COUNTRY = 'Saudi Arabia'",
        renderer: new SimpleRenderer({
          symbol: new SimpleFillSymbol({
            color: [0, 0, 0, 0],
            outline: { color: [59, 130, 246, 1], width: 2 },
          }),
        }),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ksaLayer as any).effect = 'bloom(0.5, 1px, 0)';
      map.add(ksaLayer, 0);

      await ksaLayer.when();
      if (this.isDestroyed || !this.mapView) return;

      const result = await ksaLayer.queryExtent();
      if (result?.extent) {
        this.ksaExtent = result.extent;
        // expand(1.05) adds a tiny margin so the boundary line stays visible inside the panel
        await this.mapView.goTo(result.extent.expand(1.05), { duration: 600, animate: true });
      }
    } catch (err: unknown) {
      console.warn('[WellsOverview] KSA boundary unavailable:', err);
    }
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
