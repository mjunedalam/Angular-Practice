/** Conversion: 1 psi pressure difference ≈ 2.3072 ft of equivalent water head */
const FT_HEAD_PER_PSI = 2.3072;

/**
 * Pump test productivity index: PI = Q / (DWL - SWL)
 * Returns GPM/ft, or null if inputs are missing or drawdown is zero.
 */
export function calcPumpProductivityIndex(
  pumpRateGpm: number | null | undefined,
  dynamicWaterLevelFt: number | null | undefined,
  staticWaterLevelFt: number | null | undefined,
): number | null {
  if (pumpRateGpm == null || dynamicWaterLevelFt == null || staticWaterLevelFt == null) return null;
  const drawdown = dynamicWaterLevelFt - staticWaterLevelFt;
  if (drawdown === 0) return null;
  return pumpRateGpm / drawdown;
}

/**
 * Flow test productivity index: PI = Q / (FT_HEAD_PER_PSI × (SIWHP - FWHP))
 * Converts pressure differential to equivalent head before dividing.
 * Returns GPM/ft, or null if inputs are missing or equivalent drawdown is zero.
 */
export function calcFlowProductivityIndex(
  flowRateGpm: number | null | undefined,
  shutInWellheadPressurePsi: number | null | undefined,
  flowingWellheadPressurePsi: number | null | undefined,
): number | null {
  if (flowRateGpm == null || shutInWellheadPressurePsi == null || flowingWellheadPressurePsi == null) return null;
  const equivalentDrawdown = FT_HEAD_PER_PSI * (shutInWellheadPressurePsi - flowingWellheadPressurePsi);
  if (equivalentDrawdown === 0) return null;
  return flowRateGpm / equivalentDrawdown;
}
