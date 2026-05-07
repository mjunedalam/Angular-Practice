import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point';

import Polygon from '@arcgis/core/geometry/Polygon';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';

export const MAP_BOUNDS = {
  minLat: 16.3,
  maxLat: 32.2,
  minLng: 34.5,
  maxLng: 55.7,
};

export const KSA_EXTENT = {
  xmin: 34.5, ymin: 16.3,
  xmax: 55.7, ymax: 32.2,
  spatialReference: { wkid: 4326 },
};
//Configruation for Central Asia
// minLat: 24.65,
// maxLat: 39.78,
// minLng: 44.03,
// maxLng: 63.33

export const tilesArray = [
  { color: [132, 224, 63, 0.9], biNum: '3300' },
  { color: [199, 153, 240, 0.9], biNum: '58' },
  { color: [245, 100, 109, 0.9], biNum: '1514' },
  { color: [182, 216, 242, 0.9], biNum: '60' }
];

export const tilesMap = new Map<string, { color: number[]; biNum: string }>(
  tilesArray.map((tile) => [tile.biNum, tile]));

export const MAP_CONFIG = {
  center:  [45.0, 24.5] as [number, number],
  zoom:    6,
  minZoom: 5,
  maxZoom: 14,
  defaultExtent: {
    xmin: 33.819,
    ymin: 12.894,
    xmax: 58.702,
    ymax: 32.699,
    spatialReference: { wkid: 4326 },
  },
};

const baseUrl = window.location.origin;
const iconUrl = `${baseUrl}/assets/images/oil-rig-icon.png`;

type ArcGISTextWeight = 'normal' | 'bold' | 'lighter' | 'bolder';

interface ArcGISTextFont {
  size: number | string;
  weight: ArcGISTextWeight;
  family: string;
}

export const STYLE = {
  markerIcon: iconUrl,
  markerSize: 33,
  bubbleSize: 25,
  squareSize: 53,
  stickColor: [10, 40, 0],
  bubbleColor: [0, 255, 0, 0.9],
  textFont: { size: 12, weight: 'normal', family: 'sans-serif' } as ArcGISTextFont,
};

export interface WWellGraphics {
  wwellId: number;
  polyline: Polyline;
  bubble: Point;
  radius: number
}

export interface WWellResult {
  stickGraphic: Graphic;
  bubbleGraphic: Graphic;
}

export interface WWell {
  wwellId: string;
  lat: number;
  lng: number;
  location: string;
  label: string;
}

export interface WWellResult {
  stickGraphic: Graphic,
  bubbleGraphic: Graphic
}

export interface BubblePoint {
  latitude: number;
  longitude: number;
}
export { Point as ArcGISPoint };

export const lineSymbol = (color: number[]) =>
  new SimpleLineSymbol({ color, width: 2 });

export const wwellIdTextSymbol = (font: ArcGISTextFont) =>
  new TextSymbol({
    color: [0, 0, 0],
    font,
    horizontalAlignment: 'center',
    verticalAlignment: 'top',
    xoffset: 0,
    yoffset: 8,
  });

export const locationTextSymbol = (font: ArcGISTextFont) =>
  new TextSymbol({
    color: [255, 255, 255],
    font,
    horizontalAlignment: 'center',
    verticalAlignment: 'bottom',
    xoffset: 0,
    yoffset: -9,
  });

export const topPolygonTemplate = new Polygon({
  rings: [
    [
      [-1.0, 0.4],//top-left
      [1.0, 0.4], //top-right
      [1.0, 0], //bottom-right
      [-1.0, 0], //bottom-left
      [-1.0, 0.4], //close
    ],
  ],
  spatialReference: { wkid: 4326 },
});

export const bottomPolygonTemplate = new Polygon({
  rings: [
    [
      [-0.6, 0],
      [0.6, 0],
      [0.6, -0.4],
      [-0.6, -0.4],
      [-0.6, 0],
    ],
  ],
  spatialReference: { wkid: 4326 },
});
export const MAX_WIDTH = 1500;
export const LEGEND_FONT_SMAAL_BOLD = Object.freeze({ size: 11, weight: 'bold', family: 'sans-serif' });
