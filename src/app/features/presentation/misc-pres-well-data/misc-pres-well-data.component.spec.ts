import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiscPresWellDataComponent } from './misc-pres-well-data.component';
import { MiscWellData } from '@models/active-wwell/active-wwell-view.model';
import { PresentationStore } from '../store/presentation.store';

const baseMiscWellData: MiscWellData = {
  wellName: 'Well-1',
  targetDesc: 'Target',
  targetedAquifer: 'Aquifer A',
  currentStatus: 'Active',
  daysSinceSpud: 0,
  targetDays: 0,
  biNum: '33',
  supportings: 'Zone A',
  feetDrilledToday: 0,
  previousWell: 'N/A',
  currentDepth: 0,
  nextWell: 'N/A',
  footage: 0,
  operationSummary: '',
  next24HrOperation: '',
  rop: 0,
  actualRm: 1,
  kpiRm: 2,
  rigMoveDays: null,
  spudDate: 'N/A',
  rigName: 'Rig-1',
  rigHeight: null,
  previousDepth: 0,
  drlgSmryRmk: null,
  holeSize: null,
};

const presentationStoreMock = {
  miscWellData: jest.fn<MiscWellData | null, []>(() => null),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

describe('MiscPresWellDataComponent', () => {
  let component: MiscPresWellDataComponent;
  let fixture: ComponentFixture<MiscPresWellDataComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MiscPresWellDataComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MiscPresWellDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Normalizes raw biNum codes (with/without a "BI" prefix, padded variants,
  // known aliases like 1514→34) to the canonical "BI-<num>" display text.
  describe('BI cell number normalization', () => {
    it.each([
      ['33', '33'],
      ['58', '58'],
      ['34', '34'],
      ['60', '60'],
      ['1514', '34'],
      ['BI1514', '34'],
      ['3300', '33'],
      ['BI3300', '33'],
    ])('biDisplayNum("%s") resolves to "%s"', (biNum, expected) => {
      expect((component as unknown as { biDisplayNum: (v: string) => string }).biDisplayNum(biNum)).toBe(expected);
    });

    it('falls back to the raw value for an unrecognized biNum', () => {
      expect((component as unknown as { biDisplayNum: (v: string) => string }).biDisplayNum('999')).toBe('999');
    });

    // OnPush + a plain mock (not a real Signal) only re-renders correctly on a
    // fixture's *first* detectChanges() call, so each scenario gets its own fresh
    // fixture created after the store return value is set, mirroring how the real
    // NgRx SignalStore-backed template actually re-renders off signal reads.
    it('renders "BI-34" in the BI cell for a raw biNum of "BI1514"', () => {
      presentationStoreMock.miscWellData.mockReturnValue({ ...baseMiscWellData, biNum: 'BI1514' });
      const freshFixture = TestBed.createComponent(MiscPresWellDataComponent);
      freshFixture.detectChanges();

      const biCell = freshFixture.nativeElement.querySelector('.cell--bi .bi-num') as HTMLElement;
      expect(biCell.textContent?.trim()).toBe('BI-34');
    });

    it('renders "BI-33" in the BI cell for a raw biNum of "3300"', () => {
      presentationStoreMock.miscWellData.mockReturnValue({ ...baseMiscWellData, biNum: '3300' });
      const freshFixture = TestBed.createComponent(MiscPresWellDataComponent);
      freshFixture.detectChanges();

      const biCell = freshFixture.nativeElement.querySelector('.cell--bi .bi-num') as HTMLElement;
      expect(biCell.textContent?.trim()).toBe('BI-33');
    });
  });
});
