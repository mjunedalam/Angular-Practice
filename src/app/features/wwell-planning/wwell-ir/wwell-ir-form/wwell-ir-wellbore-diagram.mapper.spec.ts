import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  wellboreDiagramDataEqual,
} from './wwell-ir-wellbore-diagram.mapper';
import { WwellIrRawReference } from './wwell-ir-form.types';

/** Only the branches this mapper actually reads — everything else stays off the fixture so a change
 *  elsewhere in the (large) IntegratedRequirement shape does not drag this spec along with it. */
function buildIr(overrides: Partial<IntegratedRequirement> = {}): IntegratedRequirement {
  return {
    requestReference: {
      wellName: 'HAIL-500',
      targetDepthFt: 4000,
      surfaceElevationFtAsl: 980,
    },
    casing: [
      { type: 'Conductor', sizeIn: '24"', depthFtBgl: 100, tolFtBgl: null, remarks: '' },
      { type: 'Liner', sizeIn: '7"', depthFtBgl: 3430, tolFtBgl: 3000, remarks: '' },
    ],
    formationTops: [{ name: 'ARUM', depthFt: 1855, subSeaFtAsl: 1015 }],
    programDetails: {
      completion: 'Screened',
      openHoleSizeIn: '8 1/2"',
      acidization: '',
      transmission: '',
      wellDesignFlags: null,
    },
    testProgram: { testType: '', siwhpPsi: null, estimatedRateGpm: null, estimatedWaterLevelFt: null },
    hydrogeology: { aquifer: 'Saq', estimatedTdsPpm: null, h2sPpm: null, estimatedPumpDepthFt: null },
    ...overrides,
  } as unknown as IntegratedRequirement;
}

function buildReference(overrides: Partial<WwellIrRawReference> = {}): WwellIrRawReference {
  return {
    linkedRequestId: '',
    letterNumber: 'LTR-2026-0456',
    client: 'BI-12',
    supportingBusiness: 'Agriculture',
    wellName: 'HAIL-500',
    targetAquifer: 'Saq',
    targetDepthFt: 4000,
    surfaceElevationFtAsl: 980,
    coordinates: '',
    ...overrides,
  };
}

describe('buildWellboreDiagramDataFromIntegratedRequirement — live Request Reference', () => {
  it('reads target depth from the saved record when the section is not being edited', () => {
    const data = buildWellboreDiagramDataFromIntegratedRequirement(buildIr());

    expect(data.totalDepth).toBe(4000);
    expect(data.targetDepth).toBe(4000);
  });

  it('follows the live target depth while the section is open, without waiting for a save', () => {
    // The whole vertical extent of the drawing hangs off this one number, so until the live value
    // reached the mapper the diagram stayed frozen at the last-saved depth mid-edit.
    const data = buildWellboreDiagramDataFromIntegratedRequirement(
      buildIr(),
      null,
      null,
      null,
      null,
      buildReference({ targetDepthFt: 6200 }),
    );

    expect(data.totalDepth).toBe(6200);
    expect(data.targetDepth).toBe(6200);
    expect(data.displayDepth).toBe(6200);
  });

  it('follows the live well name and surface elevation too', () => {
    const data = buildWellboreDiagramDataFromIntegratedRequirement(
      buildIr(),
      null,
      null,
      null,
      null,
      buildReference({ wellName: 'HAIL-501', surfaceElevationFtAsl: 1200 }),
    );

    expect(data.wellName).toBe('HAIL-501');
    // Surface elevation turns a formation top's depth into its sub-sea level.
    expect(data.geologicTops[0].planSsDepth).toBe(1200 - 1855);
  });

  it('keeps the drawing domain on the deepest formation top when it passes a live target depth', () => {
    const data = buildWellboreDiagramDataFromIntegratedRequirement(
      buildIr(),
      null,
      [{ name: 'DEEP', depthFt: 7400, subSeaFtAsl: null }],
      null,
      null,
      buildReference({ targetDepthFt: 5000 }),
    );

    expect(data.totalDepth).toBe(5000);
    expect(data.displayDepth).toBe(7400);
  });

  it('falls back to the static depth when the live target depth is cleared to empty', () => {
    // Mid-edit the field is briefly null. Passing 0 straight through would collapse the diagram to
    // zero height at ground level, so the builder substitutes its static fallback.
    const data = buildWellboreDiagramDataFromIntegratedRequirement(
      buildIr(),
      null,
      null,
      null,
      null,
      buildReference({ targetDepthFt: null }),
    );

    expect(data.totalDepth).toBeGreaterThan(0);
  });
});

describe('wellboreDiagramDataEqual', () => {
  it('treats two separately-built but identical results as equal', () => {
    // This is the property the editor's computed() relies on: the mapper is pure and returns a fresh
    // object every call, so reference equality would report a change on every keystroke.
    const a = buildWellboreDiagramDataFromIntegratedRequirement(buildIr());
    const b = buildWellboreDiagramDataFromIntegratedRequirement(buildIr());

    expect(a).not.toBe(b);
    expect(wellboreDiagramDataEqual(a, b)).toBe(true);
  });

  it('reports a change when a live edit moves something the diagram draws', () => {
    const before = buildWellboreDiagramDataFromIntegratedRequirement(buildIr());
    const after = buildWellboreDiagramDataFromIntegratedRequirement(
      buildIr(),
      null,
      null,
      null,
      null,
      buildReference({ targetDepthFt: 6200 }),
    );

    expect(wellboreDiagramDataEqual(before, after)).toBe(false);
  });

  it('reports a change when a casing row is added', () => {
    const before = buildWellboreDiagramDataFromIntegratedRequirement(buildIr());
    const after = buildWellboreDiagramDataFromIntegratedRequirement(buildIr(), [
      { type: 'Conductor', sizeIn: '24"', depthFtBgl: 100, tolFtBgl: null, remarks: '' },
      { type: 'Liner', sizeIn: '7"', depthFtBgl: 3430, tolFtBgl: 3000, remarks: '' },
      { type: 'Casing', sizeIn: '13 3/8"', depthFtBgl: 2020, tolFtBgl: null, remarks: '' },
    ]);

    expect(wellboreDiagramDataEqual(before, after)).toBe(false);
  });

  it('reports no change when an edit touches only fields the diagram never draws', () => {
    // The regression this exists for: typing a client name or a letter number used to restart the
    // whole drawing's animation.
    const before = buildWellboreDiagramDataFromIntegratedRequirement(
      buildIr(),
      null,
      null,
      null,
      null,
      buildReference(),
    );
    const after = buildWellboreDiagramDataFromIntegratedRequirement(
      buildIr(),
      null,
      null,
      null,
      null,
      buildReference({ client: 'BI-99', letterNumber: 'LTR-2026-9999', coordinates: '27°N' }),
    );

    expect(wellboreDiagramDataEqual(before, after)).toBe(true);
  });

  it('compares nested arrays element by element rather than by reference', () => {
    const a = buildWellboreDiagramDataFromIntegratedRequirement(buildIr());
    const b = buildWellboreDiagramDataFromIntegratedRequirement(
      buildIr({
        formationTops: [{ name: 'ARUM', depthFt: 1900, subSeaFtAsl: 1015 }],
      } as Partial<IntegratedRequirement>),
    );

    expect(wellboreDiagramDataEqual(a, b)).toBe(false);
  });

  it('handles nulls on either side', () => {
    const data = buildWellboreDiagramDataFromIntegratedRequirement(buildIr());

    expect(wellboreDiagramDataEqual(null, null)).toBe(true);
    expect(wellboreDiagramDataEqual(data, null)).toBe(false);
    expect(wellboreDiagramDataEqual(null, data)).toBe(false);
  });
});
