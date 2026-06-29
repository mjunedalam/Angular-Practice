import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import { watch as reactiveWatch, watch } from '@arcgis/core/core/reactiveUtils';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import Polyline from '@arcgis/core/geometry/Polyline';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import { MatCardModule } from '@angular/material/card';
import { IWellData } from '@models/well-design/well-data.model';
import { MorningReportStore } from '../morning-report/store/morning-report.store';
import { LoaderService } from 'src/app/shared/components/global-loader/loader.service';
import {
  lineSymbol,
  locationTextSymbol,
  MAP_CONFIG,
  MAX_WIDTH,
  STYLE,
  tilesArray,
  WWell,
  wwellIdTextSymbol,
} from 'src/app/shared/models/config/agwa-map.config';
import { findNonOverlappingPosition } from 'src/app/shared/utils/wwell-placement-utils';
import { EsriMapService } from '@core/services/esri-map.service';
import { ExternalConfigService } from '@shared/services/external-config.service';
import { getMockKsaWwells } from './mock-wwells.util';

const WWELL_MAP_BOOT_TASK = 'arcgis-map';

// Mirrors `.wwell-map-legend__chip--*` colors in wwell-map.component.scss
// so the email's baked-in legend matches the legend shown outside the map.
const LEGEND_CHIP_COLORS: Record<string, string> = {
  '3300': '#84cc16',
  '58': '#c084fc',
  '1514': '#f87171',
  '60': '#60a5fa',
};

// RGB equivalents of LEGEND_CHIP_COLORS — used for ArcGIS symbol colors so
// map dots/sticks/bubbles always match the legend chips.
const DOT_COLOR: Record<string, [number, number, number, number]> = {
  '3300': [132, 204, 22, 0.9],   // #84cc16
  '58':   [192, 132, 252, 0.9],  // #c084fc
  '1514': [248, 113, 113, 0.9],  // #f87171
  '60':   [96, 165, 250, 0.9],   // #60a5fa
};

@Component({
  selector: 'app-wwellmap',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './wwell-map.component.html',
  styleUrl: './wwell-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellmapComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl?: ElementRef<HTMLDivElement>;

  private mapView?: __esri.MapView;
  private wwellLayer?: GraphicsLayer;
  private bubbleLayer?: GraphicsLayer;
  private stationaryWatchHandle?: __esri.WatchHandle;
  private placedBubbles: { x: number; y: number; radius: number }[] = [];
  private bootTaskRegistered = false;
  private mapRetryTimeoutId?: ReturnType<typeof setTimeout>;
  private defaultSnapshotTimeoutId?: ReturnType<typeof setTimeout>;
  private defaultMapSnapshotBase64: string | null = null;
  private defaultSnapshotInFlight: Promise<string | undefined> | null = null;
  private wwellIconsRenderTask: Promise<void> = Promise.resolve();
  private intersectionObserver?: IntersectionObserver;
  private isDestroyed = false;

  protected readonly mapReady = signal(false);
  private readonly wwells = signal<WWell[]>([]);
  private readonly bubbleLayerReady = signal<GraphicsLayer | null>(null);

  private readonly MAP_TIMEOUT_MS = 20_000;
  private readonly MAX_RETRY_DELAY_MS = 30_000;
  private readonly INITIAL_ZOOM = 6;


  private readonly platformId = inject(PLATFORM_ID);
  private readonly loader = inject(LoaderService);
  private readonly esriAuth = inject(EsriMapService);
  private readonly store = inject(MorningReportStore);
  private readonly extConfigService = inject(ExternalConfigService);

  constructor() {
    effect(() => {
      this.buildWWellSignal(this.store.allWellsData());
    });

    effect(() => {
      this.wwells();
      if (!this.mapReady() || !this.wwellLayer) return;
      this.wwellIconsRenderTask = this.drawWWellIcons(this.wwellLayer).catch(e =>
        console.error('[WwellMap] drawWWellIcons failed', e)
      );
    });

    effect(() => {
      this.wwells();
      const layer = this.bubbleLayerReady();
      if (!layer) return;
      this.layoutBubbles(layer);
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.observeVisibility();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    clearTimeout(this.mapRetryTimeoutId);
    this.clearDefaultSnapshotTimer();
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
    this.initMap().then(() => {
      if (attempt > 0) console.log(`[Map] Connected after ${attempt + 1} attempt(s)`);
    }).catch((err: unknown) => {
      if (this.isDestroyed) return;
      const delay = Math.min(1000 * Math.pow(2, attempt), this.MAX_RETRY_DELAY_MS);
      console.warn(`[Map] Reconnecting… attempt ${attempt + 1} (retry in ${delay / 1000}s)`, err);
      this.mapRetryTimeoutId = setTimeout(() => this.initMapWithRetry(attempt + 1), delay);
    });
  }

  private async initMap(): Promise<void> {
    this.mapView?.destroy();
    this.mapView = undefined;
    this.defaultMapSnapshotBase64 = null;
    this.defaultSnapshotInFlight = null;
    this.clearDefaultSnapshotTimer();
    this.mapReady.set(false);
    this.bubbleLayerReady.set(null);

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
        setTimeout(() => reject(new Error('Map initialization timed out')), this.MAP_TIMEOUT_MS),
      ),
    ]);

    if (webMap.loadStatus === 'failed') {
      throw webMap.loadError ?? new Error('WebMap failed to load');
    }

    this.mapView.zoom = this.INITIAL_ZOOM;
    this.mapView.center = { longitude: MAP_CONFIG.center[0], latitude: MAP_CONFIG.center[1] } as __esri.Point;
    await this.mapView.goTo({ center: MAP_CONFIG.center, zoom: this.INITIAL_ZOOM }, { animate: true });

    this.wwellLayer = new GraphicsLayer({ id: 'WWell-icons' });
    this.bubbleLayer = new GraphicsLayer({ id: 'WWell-bubbles' });
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

    this.scheduleDefaultMapSnapshot();
  }

  private buildWWellSignal(data: IWellData[]): void {
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
    this.defaultMapSnapshotBase64 = null;
    this.wwells.set(wells.length ? wells : getMockKsaWwells());
    this.scheduleDefaultMapSnapshot();
  }

  private async drawWWellIcons(layer: GraphicsLayer): Promise<void> {
    layer.removeAll();
    const { default: SimpleMarkerSymbol } = await import('@arcgis/core/symbols/SimpleMarkerSymbol');
    for (const wwell of this.wwells()) {
      const point = new Point({ latitude: wwell.lat, longitude: wwell.lng });
      const [r, g, b] = DOT_COLOR[wwell.label] ?? [200, 200, 200, 0.9];
      layer.add(new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({ style: 'circle', size: 13, color: [r, g, b, 1], outline: { color: [255, 255, 255, 0.9], width: 1.5 } }),
        attributes: { wwellId: wwell.wwellId, location: wwell.location },
      }));
    }
    this.scheduleDefaultMapSnapshot();
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
        symbol: lineSymbol(DOT_COLOR[wwell.label] ?? STYLE.stickColor),
      }));

      graphics.push(new Graphic({
        geometry: new Polygon({
          rings: [[[cx - halfTopW, cy + topH], [cx + halfTopW, cy + topH],
          [cx + halfTopW, cy], [cx - halfTopW, cy], [cx - halfTopW, cy + topH]]],
          spatialReference: { wkid: 4326 },
        }),
        symbol: new SimpleFillSymbol({
          color: DOT_COLOR[wwell.label] ?? [200, 200, 200, 0.9],
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
    this.scheduleDefaultMapSnapshot();
  }

  private async waitForMapRender(): Promise<void> {
    if (!this.mapView) return;
    if (!this.mapView.updating) { await new Promise(requestAnimationFrame); return; }
    await new Promise<void>((resolve) => {
      const handle = watch(
        () => this.mapView?.updating ?? false,
        (updating) => { if (!updating) { handle.remove(); requestAnimationFrame(() => resolve()); } },
      );
    });
  }

  async saveMapImage(): Promise<void> {
    const base64 = await this.captureMapAsBase64();
    this.downloadBase64(base64, 'water-wells-map.png');
  }

  async captureMapAsBase64(): Promise<string | undefined> {
    if (!this.mapView) return;
    await this.waitForMapRender();
    await this.wwellIconsRenderTask;
    return this.getScreenshotBase64();
  }

  async captureDefaultMapAsBase64(): Promise<string | undefined> {
    if (this.defaultMapSnapshotBase64) {
      return this.defaultMapSnapshotBase64;
    }

    if (this.defaultSnapshotInFlight) {
      return this.defaultSnapshotInFlight;
    }

    this.defaultSnapshotInFlight = this.captureDefaultMapSnapshot();

    try {
      this.defaultMapSnapshotBase64 = await this.defaultSnapshotInFlight ?? null;
      return this.defaultMapSnapshotBase64 ?? undefined;
    } finally {
      this.defaultSnapshotInFlight = null;
    }
  }

  private scheduleDefaultMapSnapshot(): void {
    if (
      this.isDestroyed ||
      !this.mapReady() ||
      !this.mapView ||
      !this.wwellLayer ||
      !this.bubbleLayer ||
      this.defaultMapSnapshotBase64 ||
      this.defaultSnapshotInFlight
    ) {
      return;
    }

    this.clearDefaultSnapshotTimer();
    this.defaultSnapshotTimeoutId = setTimeout(() => {
      void this.captureDefaultMapAsBase64().catch(error => {
        console.warn('[WwellMap] Default map snapshot failed', error);
      });
    }, 500);
  }

  private clearDefaultSnapshotTimer(): void {
    if (this.defaultSnapshotTimeoutId === undefined) return;
    clearTimeout(this.defaultSnapshotTimeoutId);
    this.defaultSnapshotTimeoutId = undefined;
  }

  private async captureDefaultMapSnapshot(): Promise<string | undefined> {
    if (!this.mapView) return;

    this.clearDefaultSnapshotTimer();
    const previousViewpoint = this.mapView.viewpoint?.clone() ?? null;

    await this.goToDefaultView(false);
    await this.waitForMapRender();

    // drawWWellIcons() is async (dynamic import); ensure well markers
    // are fully rendered before screenshotting, or the layer can be
    // mid-redraw (cleared, not yet repopulated) and the snapshot will
    // show the base map without any well icons.
    await this.wwellIconsRenderTask;

    if (this.bubbleLayer) {
      this.layoutBubbles(this.bubbleLayer);
      await this.waitForMapRender();
    }

    const base64 = await this.getScreenshotBase64();

    if (!this.isDestroyed && previousViewpoint && this.mapView) {
      await this.mapView.goTo(previousViewpoint, { animate: false });
      await this.waitForMapRender();
      if (this.bubbleLayer) this.layoutBubbles(this.bubbleLayer);
    }

    return base64;
  }

  private async goToDefaultView(animate: boolean): Promise<void> {
    if (!this.mapView) return;

    await this.mapView.goTo(
      { center: MAP_CONFIG.center, zoom: this.INITIAL_ZOOM },
      { animate },
    );
  }

  private async getScreenshotBase64(): Promise<string> {
    const screenshot = await this.mapView!.takeScreenshot({ format: 'png', quality: 1 });
    const [, rawBase64] = screenshot.dataUrl.split(',');
    if (!rawBase64) throw new Error('Failed to extract Base-64 payload');

    const img = new Image();
    img.src = `data:image/png;base64,${rawBase64}`;
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

    const scale = Math.min(1, MAX_WIDTH / img.width);
    const mapWidth = img.width * scale;
    const mapHeight = img.height * scale;

    const { chipH } = this.getLegendMetrics(mapWidth);
    const legendBarPadding = Math.round(chipH * 0.6);
    const legendBarHeight = chipH + legendBarPadding * 2;

    const canvas = document.createElement('canvas');
    canvas.width = mapWidth;
    canvas.height = mapHeight + legendBarHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, mapWidth, mapHeight);

    // Legend bar lives below the map screenshot, mirroring the
    // `.wwell-map-legend` row that sits outside `.wwell-map-frame` in the UI.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, mapHeight, canvas.width, legendBarHeight);
    this.drawLegendChips(ctx, canvas.width, mapHeight, legendBarHeight);
    await new Promise((r) => setTimeout(r, 300));

    return canvas.toDataURL('image/jpeg', 1).split(',')[1];
  }

  private getLegendMetrics(canvasWidth: number): { fontSize: number; px: number; py: number; gap: number; chipH: number } {
    const fontSize = Math.max(13, Math.round(canvasWidth * 0.013));
    const px = Math.round(fontSize * 0.75);
    const py = Math.round(fontSize * 0.45);
    const gap = Math.round(fontSize * 0.6);
    const chipH = fontSize + py * 2;
    return { fontSize, px, py, gap, chipH };
  }

  private drawLegendChips(ctx: CanvasRenderingContext2D, canvasWidth: number, mapHeight: number, legendBarHeight: number): void {
    const chips = [
      { text: 'Legend', bg: '#cedf5f', textColor: '#35530a' },
      ...tilesArray.map(t => ({
        text: t.biNum,
        bg: LEGEND_CHIP_COLORS[t.biNum] ?? `rgba(${t.color[0]}, ${t.color[1]}, ${t.color[2]}, ${t.color[3] ?? 1})`,
        textColor: '#fff',
      })),
      { text: 'Aquifer', bg: '#22b8e6', textColor: '#fff' },
    ];

    const { fontSize, px, gap, chipH } = this.getLegendMetrics(canvasWidth);

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    let x = Math.round(canvasWidth * 0.01);
    const y = mapHeight + (legendBarHeight - chipH) / 2;

    for (const chip of chips) {
      const cw = Math.max(chipH * 2, ctx.measureText(chip.text).width + px * 2);
      ctx.fillStyle = chip.bg;
      ctx.beginPath();
      ctx.roundRect(x, y, cw, chipH, chipH / 2);
      ctx.fill();
      ctx.fillStyle = chip.textColor;
      ctx.fillText(chip.text, x + px, y + chipH / 2);
      x += cw + gap;
    }
  }

  private downloadBase64(base64: string | undefined, fileName: string): void {
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${base64}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private registerBootTask(): void {
    if (this.bootTaskRegistered) return;
    this.bootTaskRegistered = true;
    this.loader.registerBootTask(WWELL_MAP_BOOT_TASK);
  }

  private resolveBootTask(): void {
    if (!this.bootTaskRegistered) return;
    this.bootTaskRegistered = false;
    this.loader.resolveBootTask(WWELL_MAP_BOOT_TASK);
  }
}
