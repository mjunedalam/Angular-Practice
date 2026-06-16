const FLOW_PSI_TO_FT = 2.3072;

export function calcPumpWellProductivity(
  testRate: number | null | undefined,
  dwl: number | null | undefined,
  swl: number | null | undefined,
): number | null {
  if (testRate == null || dwl == null || swl == null) return null;
  const drawdown = dwl - swl;
  if (drawdown === 0) return null;
  return testRate / drawdown;
}

export function calcFlowWellProductivity(
  testRate: number | null | undefined,
  siwhp: number | null | undefined,
  fwhp: number | null | undefined,
): number | null {
  if (testRate == null || siwhp == null || fwhp == null) return null;
  const drawdown = FLOW_PSI_TO_FT * (siwhp - fwhp);
  if (drawdown === 0) return null;
  return testRate / drawdown;
}
