import { CasingInfo, GeologicTop, Hydrogeology, PreWap, RigActivity } from './well-details.model';

export interface WellboreDiagramData {
  readonly wellName: string;
  readonly totalDepth: number;
  readonly casings: CasingInfo[];
  readonly geologicTops: GeologicTop[];
  readonly hydrogeology: Hydrogeology | null;
  readonly prewap: PreWap | null;
  readonly rigActivity: RigActivity | null;
  readonly currentDepth: number;
}

export interface DiagramLayout {
  readonly svgHeight: number;
  readonly marginTop: number;
  readonly drawingHeight: number;
  readonly depthScaleWidth: number;
  readonly depthAxisX: number;
  readonly wellboreViewWidth: number;
  readonly geoLineX: number;
  readonly casingCenterX: number;
  readonly baseHalfWidth: number;
  readonly halfWidthIncrement: number;
  readonly shoeCurveOffset: number;
}

export const DIAGRAM_LAYOUT: DiagramLayout = {
  svgHeight: 840,
  marginTop: 55,
  drawingHeight: 740,
  depthScaleWidth: 90,
  depthAxisX: 62,
  wellboreViewWidth: 980,
  geoLineX: 155,
  casingCenterX: 490,
  baseHalfWidth: 72,
  halfWidthIncrement: 22,
  shoeCurveOffset: 15,
};

export const ANIM = {
  SCALE_DURATION: 1100,
  TICK_BASE_DELAY: 100,
  CASING_DURATION: 700,
  CASING_STAGGER: 320,
  GEO_STAGGER: 60,
  GEO_DELAY: 300,
  OVERLAY_DELAY: 1500,
} as const;
