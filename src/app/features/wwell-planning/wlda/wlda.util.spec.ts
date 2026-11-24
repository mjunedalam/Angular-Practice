import { WLDA_EMPTY_DRAFT, findPlanForWell, draftOfLetter, isWldaDraftDirty, toWldaCreatePayload, toWldaUpdatePayload, validateWldaDraft, viewOfLetter, wldaS3Prefix, wldaWellName } from './wlda.util';

const plan = { prewapSeq: 5001, wPrimHid: 'HAIL', wNum: '601', wellType: null, tdMd: 3000, targetForm: null, gospAreaPlant: null, svUtmZn: 38 };

describe('wlda.util', () => {
  const valid = {
    ...WLDA_EMPTY_DRAFT,
    waterWellName: 'HAIL-601',
    field: 'HAIL',
    wellNumber: '601',
    reservoir: 'UER',
    wellType: 'Drilling Water Supply',
    totalDepth: '3000',
    svXutmCord: '512345.67', svYutmCord: '2712345.5', svUtmZn: '38' };

  it('requires every starred field when creating', () => {
    const errors = validateWldaDraft(WLDA_EMPTY_DRAFT);
    expect(errors).toContain('Water Well Name is required.');
    expect(errors).toContain('Total Depth is required.');
    expect(errors).toContain('East (X) is required.');
  });

  it('only requires the plan when editing, where the well and location are locked', () => {
    expect(validateWldaDraft(WLDA_EMPTY_DRAFT, 'edit')).toEqual(['This letter has no pre-well plan.']);
    expect(validateWldaDraft({ ...WLDA_EMPTY_DRAFT, prewapSeq: 5001 }, 'edit')).toEqual([]);
  });

  it('accepts a fully valid draft that matches a plan', () => {
    expect(validateWldaDraft(valid, 'create', plan)).toEqual([]);
  });

  it('explains when no plan matches the typed field and well number', () => {
    expect(validateWldaDraft(valid, 'create', null)).toEqual(['No pre-well plan exists for HAIL 601 — link a water well above.']);
  });

  it('matches a plan on field code and well number, ignoring case and spaces', () => {
    const plans = [plan, { ...plan, prewapSeq: 5002, wNum: '602' }];
    expect(findPlanForWell(plans, ' hail ', '602')?.prewapSeq).toBe(5002);
    expect(findPlanForWell(plans, 'HAIL', '999')).toBeNull();
    expect(findPlanForWell(plans, '', '601')).toBeNull();
  });

  it('rejects coordinates over the column precision', () => {
    const errors = validateWldaDraft({ ...valid, svXutmCord: '1000000', svYutmCord: '1.234' }, 'create', plan);
    expect(errors).toHaveLength(2);
  });

  it('rejects a zone outside 1-60', () => {
    expect(validateWldaDraft({ ...valid, svUtmZn: '61' }, 'create', plan)).toHaveLength(1);
  });

  it('counts remarks in UTF-8 bytes', () => {
    expect(validateWldaDraft({ ...valid, ltrRmks: 'ع'.repeat(1001) }, 'create', plan)).toHaveLength(1);
  });

  it('builds a payload with nulls for blanks and untouched SAP columns', () => {
    expect(toWldaCreatePayload({ ...valid, svYutmCord: '', ltrRmks: '  ' })).toEqual({
      svXutmCord: 512345.67,
      svYutmCord: null,
      svUtmZn: 38,
      ltrRmks: null,
      sapWfId: null,
      sapWfStatus: null,
      sapWfAprvDt: null,
    });
  });

  it('builds the S3 prefix and well name', () => {
    expect(wldaS3Prefix(5001, 7)).toBe('wlda-letters/prewap-5001/ltr-7');
    expect(wldaWellName({ wPrimHid: 'HAIL', wNum: '601' })).toBe('HAIL 601');
  });
});

describe('wlda.util edit helpers', () => {
  const letter = {
    prewapSeq: 5001, ltrId: 7, svXutmCord: 512345.67, svYutmCord: 2712345.5, svUtmZn: 38, ltrRmks: 'old',
    sapWfId: 9, sapWfStatus: 'APPROVED', sapWfAprvDt: '2026-02-25', epCrDataDt: null, epCrDataCd: null,
    wPrimHid: 'HAIL', wNum: '601', wellType: null, tdMd: 3000, targetForm: null, gospAreaPlant: null, currentFlg: 'Y',
  };

  it('echoes the SAP columns back on update so the proc does not wipe them', () => {
    const payload = toWldaUpdatePayload({ ...draftOfLetter(letter), ltrRmks: 'new' }, letter);
    expect(payload).toEqual({ ltrRmks: 'new', sapWfId: 9, sapWfStatus: 'APPROVED', sapWfAprvDt: '2026-02-25' });
  });

  it('is dirty only after a real change', () => {
    const draft = draftOfLetter(letter);
    expect(isWldaDraftDirty(draft, letter)).toBe(false);
    expect(isWldaDraftDirty({ ...draft, ltrRmks: 'changed' }, letter)).toBe(true);
    expect(isWldaDraftDirty({ ...draft, removedKeys: ['k'] }, letter)).toBe(true);
  });

  it('hides removed stored files and appends pending ones while editing', () => {
    const stored = [
      { key: 'a', name: 'a.pdf', pendingIndex: null },
      { key: 'b', name: 'b.pdf', pendingIndex: null },
    ];
    const draft = { ...draftOfLetter(letter), removedKeys: ['a'], files: [new File(['x'], 'c.pdf')] };
    expect(viewOfLetter(letter, stored, draft).attachments.map(file => file.name)).toEqual(['b.pdf', 'c.pdf']);
  });
});
