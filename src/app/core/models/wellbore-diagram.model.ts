import { ICasingIR } from 'src/app/shared/models/wwell/casing-ir.model';
import { CasingInfo, GeologicTop, Hydrogeology, PreWap, RigActivity } from './well-details.model';
import { ITopsIR } from 'src/app/shared/models/wwell/top-sir.model';
import { IHydrogeologyIR } from 'src/app/shared/models/wwell/hydrogeology-ir.model';
import { IPreWellData } from 'src/app/shared/models/wwell/pre-well-data.model';
import { IRigActivity } from 'src/app/shared/models/wwell/rig-activity.model';

export interface WellboreDiagramData {
  readonly wellName: string;
  readonly totalDepth: number;
  readonly casings: ICasingIR[]
  readonly geologicTops: ITopsIR[];
  readonly hydrogeology: IHydrogeologyIR | null;
  readonly prewap: IPreWellData | null;
  readonly rigActivity: IRigActivity | null;
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
  readonly depthArrowX: number; // Controls the depth arrow's horizontal position
  readonly casingCenterX: number;
  readonly baseHalfWidth: number;
  readonly halfWidthIncrement: number;
  readonly shoeCurveOffset: number;
}

export const DIAGRAM_LAYOUT: DiagramLayout = {
  svgHeight: 840,
  marginTop: 55,
  drawingHeight: 740,
  
  // -- RESPONSIVE MIDPOINT MATH --
  depthScaleWidth: 90,
  depthAxisX: 62, // Leaves exactly 30 units from the right edge of the Depth SVG
  
  wellboreViewWidth: 980,
  geoLineX: 155,   // Starts exactly 50 units from the left edge of the Wellbore SVG
  
  // Total virtual gap = 30 + 50 = 80 units. 
  // True center is 40 units. 
  // 40 - 30 (the depth SVG gap) = 10 units perfectly into the Wellbore SVG.
  depthArrowX: 10, 
  // ------------------------------
  
  casingCenterX: 650,  // shifted right to create gap between geo horizon and bore structure
  baseHalfWidth: 48,
  halfWidthIncrement: 16,
  shoeCurveOffset: 12,
};

// Smoother, more realistic cascading animation timings
export const ANIM = {
  SCALE_DURATION: 1200,
  TICK_BASE_DELAY: 150,
  CASING_DURATION: 900,
  CASING_STAGGER: 450,
  GEO_STAGGER: 60,
  GEO_DELAY: 200,
  OVERLAY_DELAY: 1600,
} as const;