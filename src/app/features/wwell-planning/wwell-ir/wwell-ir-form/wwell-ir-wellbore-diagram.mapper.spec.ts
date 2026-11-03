import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  deriveCompletionElementFlags,
  resolveCompletionTypeFromFlags,
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

describe('Completion type → completion-element flags', () => {
  it('Open Hole carries its size in oh_remarks', () => {
    expect(deriveCompletionElementFlags('', '8 1/2"', 'Open Hole')).toMatchObject({ ohFlg: 'Y', ohRemarks: '8 1/2" Open Hole', lsFlg: 'N', perforatedFlg: 'N' });
  });

  it('Screen is drawn inside the open hole: it sets the open-hole and liner-screen flags', () => {
    expect(deriveCompletionElementFlags('', null, 'Screen')).toMatchObject({ ohFlg: 'Y', lsFlg: 'Y', gpFlg: 'N', perforatedFlg: 'N' });
  });

  it('Screen with Gravel Pack sets the open-hole, gravel-pack and screen flags', () => {
    expect(deriveCompletionElementFlags('', null, 'Screen with Gravel Pack')).toMatchObject({ ohFlg: 'Y', gpFlg: 'Y', lsFlg: 'Y', perforatedFlg: 'N' });
  });

  it('a liner pick is drawn inside the open hole too, and the hole size rides in oh_remarks', () => {
    expect(deriveCompletionElementFlags('', '8 1/2"', 'Perforated Liner', '4 1/2"')).toMatchObject({
      ohFlg: 'Y',
      ohRemarks: '8 1/2" Open Hole',
      perforatedFlg: 'Y',
    });
  });

  it('still resolves a Screen / Screen with Gravel Pack saved before the open hole was implied', () => {
    const legacyScreen = { ohFlg: 'N', ohRemarks: null, gpFlg: 'N', gpRemarks: null, perforatedFlg: 'N', perforatedRemarks: null, lsFlg: 'Y', lsRemarks: 'Screen' } as const;
    const legacyGravel = { ...legacyScreen, gpFlg: 'Y', gpRemarks: 'Gravel Pack' } as const;
    expect(resolveCompletionTypeFromFlags(legacyScreen)?.completionType).toBe('Screen');
    expect(resolveCompletionTypeFromFlags(legacyGravel)?.completionType).toBe('Screen with Gravel Pack');
  });

  it.each([
    ['Pre-Perforated Liner', '7" Pre-Perforated Liner'],
    ['Perforated Liner', '4 1/2" Perforated Liner'],
  ])('%s puts the entered liner size in the perforated label the diagram draws', (type, label) => {
    const size = label.startsWith('7') ? '7"' : '4 1/2"';
    expect(deriveCompletionElementFlags('', null, type, size)).toMatchObject({ perforatedFlg: 'Y', perforatedRemarks: label });
  });

  it('ignores the Completion Remarks text once a type is picked', () => {
    expect(deriveCompletionElementFlags('Open Hole\nScreened', null, 'Screen')).toMatchObject({ ohFlg: 'Y', lsFlg: 'Y', gpFlg: 'N' });
  });

  it('still derives from the Completion Remarks text when no type is picked (legacy records)', () => {
    expect(deriveCompletionElementFlags('Open Hole', '8 1/2"')).toMatchObject({ ohFlg: 'Y', ohRemarks: '8 1/2" Open Hole' });
  });

  it.each([
    ['Open Hole', null, '8 1/2"'],
    ['Screen', null, null],
    ['Screen with Gravel Pack', null, null],
    ['Pre-Perforated Liner', '7"', null],
    ['Perforated Liner', '4 1/2"', null],
  ])('round-trips %s through the persisted flags', (type, linerSize, ohSize) => {
    const flags = deriveCompletionElementFlags('', ohSize, type, linerSize);
    expect(resolveCompletionTypeFromFlags(flags)).toEqual({ completionType: type, linerSizeIn: linerSize });
  });

  it('reads Open Hole + Screened as a Screen, which is drawn in an open hole anyway', () => {
    const legacy = deriveCompletionElementFlags('Open Hole\nScreened', '8 1/2"');
    expect(resolveCompletionTypeFromFlags(legacy)?.completionType).toBe('Screen');
  });

  it('leaves an unmatched flag mix unresolved so a re-save cannot collapse it onto one pick', () => {
    const mix = { ohFlg: 'Y', ohRemarks: '8 1/2"', gpFlg: 'Y', gpRemarks: 'Gravel Pack', perforatedFlg: 'N', perforatedRemarks: null, lsFlg: 'N', lsRemarks: null } as const;
    expect(resolveCompletionTypeFromFlags(mix)).toBeNull();
  });
});

describe('Completion liner → diagram', () => {
  const withProgram = (overrides: Partial<IntegratedRequirement['programDetails']>, casing: IntegratedRequirement['casing'] = []) => {
    const base = buildIr();
    return buildIr({ casing, programDetails: { ...base.programDetails, ...overrides, wellDesignFlags: undefined } });
  };

  it('draws the picked liner as a Liner casing, run down to the target depth', () => {
    const data = buildWellboreDiagramDataFromIntegratedRequirement(
      withProgram({ completionType: 'Pre-Perforated Liner', linerSizeIn: '7"' }, [
        { type: 'Surface', sizeIn: '13 3/8"', depthFtBgl: 500, tolFtBgl: null, remarks: null },
      ]),
    );

    expect(data.casings).toContainEqual(expect.objectContaining({ csgType: 'Liner', csgSize: '7"', csgDepth: data.targetDepth }));
  });

  it('does not duplicate a liner of that size already in the Casing table', () => {
    const data = buildWellboreDiagramDataFromIntegratedRequirement(
      withProgram({ completionType: 'Perforated Liner', linerSizeIn: '7"' }, [
        { type: 'Liner', sizeIn: '7"', depthFtBgl: 900, tolFtBgl: 450, remarks: null },
      ]),
    );

    expect(data.casings.filter(casing => casing.csgType === 'Liner')).toHaveLength(1);
  });

  it('adds no liner for a non-liner pick or a liner pick without a size', () => {
    const open = buildWellboreDiagramDataFromIntegratedRequirement(withProgram({ completionType: 'Open Hole', linerSizeIn: '7"' }));
    const unsized = buildWellboreDiagramDataFromIntegratedRequirement(withProgram({ completionType: 'Perforated Liner', linerSizeIn: null }));

    expect(open.casings.some(casing => casing.csgType === 'Liner')).toBe(false);
    expect(unsized.casings.some(casing => casing.csgType === 'Liner')).toBe(false);
  });
});
