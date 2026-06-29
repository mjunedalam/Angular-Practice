jest.mock('@arcgis/core/geometry/Point', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((props: Record<string, unknown>) => ({ ...props })),
}));
jest.mock('@arcgis/core/geometry/Polygon', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@arcgis/core/geometry/Polyline', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@arcgis/core/symbols/SimpleLineSymbol', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@arcgis/core/Graphic', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@arcgis/core/layers/GraphicsLayer', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ graphics: { removeAll: jest.fn(), add: jest.fn() } })),
}));
jest.mock('@arcgis/core/symbols/SimpleFillSymbol', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@arcgis/core/symbols/TextSymbol', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

import { isValidPlacement, generateSquarePositions, toArcGIS } from './wwell-placement-utils';
import type { BubblePoint } from '../models/config/agwa-map.config';

describe('isValidPlacement', () => {
  it('returns false when bubblePoint is null', () => {
    expect(isValidPlacement(null, [], 0.01)).toBe(false);
  });

  it('returns true when there are no existing wells', () => {
    const point = { longitude: 10, latitude: 20 } as never;
    expect(isValidPlacement(point, [], 0.01)).toBe(true);
  });
});

describe('generateSquarePositions', () => {
  it('returns an array', () => {
    const result = generateSquarePositions(24.0, 46.0, 0.1, 2);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('toArcGIS', () => {
  it('converts BubblePoint to ArcGIS point shape', () => {
    const bp: BubblePoint = { latitude: 24.5, longitude: 46.5 };
    const result = toArcGIS(bp);
    expect(result).toBeDefined();
  });
});
