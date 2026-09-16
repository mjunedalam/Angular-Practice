import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WwellIrStore } from '../store/wwell-ir.store';
import { WwellIrService } from '../wwell-ir.service';
import { WwellIrEditorComponent } from './wwell-ir-editor.component';
import { WWELL_IR_SECTION_RAIL, wwellIrRailLeaves } from './wwell-ir-section-rail.config';

function buildIr(overrides: Partial<IntegratedRequirement> = {}): IntegratedRequirement {
  return {
    id: 'IR-9001',
    code: 'IR-9001',
    irSeq: 9001,
    updatedDate: '2026-08-01',
    status: 'draft',
    requestReference: {
      linkedRequestId: null,
      letterNumber: null,
      client: 'BI-12',
      supportingBusiness: 'Agriculture',
      wellName: 'HAIL-500',
      targetAquifer: 'Saq',
      targetDepthFt: 500,
      surfaceElevationFtAsl: 900,
      coordinates: '27.5114°N, 41.7208°E',
    },
    formationTops: [],
    topsRemarks: null,
    casing: [],
    programDetails: {
      completion: 'Open Hole',
      openHoleSizeIn: null,
      acidization: '',
      transmission: '',
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
    },
    contacts: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: null },
    offsetWells: [],
    offsetWellsRemarks: null,
    hydrogeology: { aquifer: 'Saq', estimatedTdsPpm: null, h2sPpm: null, estimatedPumpDepthFt: null },
    testProgram: { testType: 'flow-test', estimatedRateGpm: null, estimatedWaterLevelFt: null, siwhpPsi: null },
    attachments: [],
    chain: [],
    sapWfId: null,
    ...overrides,
  };
}

const creatingIrSignal = signal(false);
const createIrErrorSignal = signal<string | null>(null);
const deletingIrSignal = signal(false);
const updatingIrStatusSignal = signal(false);

const storeMock = {
  creatingIr: creatingIrSignal,
  createIrError: createIrErrorSignal,
  createIr: jest.fn(),
  submitIrForReview: jest.fn(),
  deletingIr: deletingIrSignal,
  deleteIr: jest.fn(),
  updatingIrStatus: updatingIrStatusSignal,
  linkedRequestWells: jest.fn(() => [] as import('../wwell-ir-form/wwell-ir-payload.model').IrEligibleWell[]),
  linkedRequestWellOptions: jest.fn(() => [] as { value: string; label: string }[]),
  loadLinkedRequestWells: jest.fn(),
  geologistOptions: jest.fn(() => [] as string[]),
  geologistEmpNumByName: jest.fn(() => ({}) as Readonly<Record<string, number>>),
  loadGwdOpsMembers: jest.fn(),
  busyAttachmentSlot: jest.fn(() => null),
  attachmentUploadPercent: jest.fn(() => null),
  attachmentError: jest.fn(() => null),
  pendingAttachments: jest.fn(() => ({}) as Partial<Record<string, File>>),
  deleteIrAttachment: jest.fn(),
  setPendingAttachment: jest.fn(),
  removePendingAttachment: jest.fn(),
  uploadStagedAttachment: jest.fn(),
};

/** The editor only reaches the service for an attachment's download URL — the uploads themselves
 *  go through the store (mocked above), so this is all the surface the component actually uses. */
const wwellIrServiceMock = {
  irAttachmentUrl: jest.fn((irSeq: number, slot: string) => `/api/integrated-requirements/${irSeq}/attachments/${slot}`),
};

const notificationServiceMock = {
  show: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

function findButtonByText(fixture: ComponentFixture<WwellIrEditorComponent>, text: string): HTMLButtonElement | undefined {
  return Array.from(fixture.nativeElement.querySelectorAll('button')).find((btn): btn is HTMLButtonElement =>
    (btn as HTMLButtonElement).textContent?.includes(text) ?? false,
  );
}

describe('WwellIrEditorComponent', () => {
  let fixture: ComponentFixture<WwellIrEditorComponent>;

  async function setup(overrides: Partial<IntegratedRequirement> = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [WwellIrEditorComponent, NoopAnimationsModule],
      providers: [
        { provide: WwellIrStore, useValue: storeMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: WwellIrService, useValue: wwellIrServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellIrEditorComponent);
    fixture.componentRef.setInput('ir', buildIr(overrides));
    fixture.detectChanges();
    // ngOnInit defaults the editor to Timeline view (see its own "defaults to Timeline view on
    // load" test below) — every other test here exercises section read/edit logic that has
    // nothing to do with which view mode is active, so they're pinned to the always-everything-
    // visible Sections layout rather than depending on whatever the current default happens to be.
    // Goes through the real toggle button (setViewMode/viewMode are protected) like a user would.
    const sectionsViewBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Sections view"]');
    sectionsViewBtn.click();
    fixture.detectChanges();
  }

  beforeEach(() => {
    jest.clearAllMocks();
    creatingIrSignal.set(false);
    createIrErrorSignal.set(null);
    deletingIrSignal.set(false);
    updatingIrStatusSignal.set(false);
  });

  afterEach(() => fixture?.destroy());

  it('should create', async () => {
    await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('defaults to Timeline view on load', async () => {
    // Deliberately bypasses setup()'s own forced switch to Sections (see its comment) to observe
    // the raw post-ngOnInit state.
    await TestBed.configureTestingModule({
      imports: [WwellIrEditorComponent, NoopAnimationsModule],
      providers: [
        { provide: WwellIrStore, useValue: storeMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: WwellIrService, useValue: wwellIrServiceMock },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(WwellIrEditorComponent);
    fixture.componentRef.setInput('ir', buildIr());
    fixture.detectChanges();

    const timelineViewBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Timeline view"]');
    expect(timelineViewBtn.classList).toContain('ire__view-toggle-btn--active');
    expect(fixture.nativeElement.querySelector('.ire__rail')).toBeNull();
    expect(fixture.nativeElement.querySelector('.ire__tl-row')).not.toBeNull();
  });

  it('renders one IR SECTIONS rail group per top-level entry, and one section anchor per leaf', async () => {
    await setup();
    const groups = fixture.nativeElement.querySelectorAll('.ire__rail-group');
    const sections = fixture.nativeElement.querySelectorAll('[id^="ire-sec-"]');
    expect(groups.length).toBe(WWELL_IR_SECTION_RAIL.length);
    expect(sections.length).toBe(wwellIrRailLeaves(WWELL_IR_SECTION_RAIL).length);
  });

  it('renders a read-only view of Wellbore Details until its pencil is clicked', async () => {
    await setup();
    expect(fixture.nativeElement.textContent).toContain('HAIL-500');
    expect(fixture.nativeElement.querySelector('app-dynamic-section')).toBeNull();

    const editBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Edit Wellbore Details"]');
    editBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-dynamic-section')).not.toBeNull();
  });

  it('saving Wellbore Details persists via store.createIr and closes edit mode', async () => {
    await setup();
    const editBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Edit Wellbore Details"]');
    editBtn.click();
    fixture.detectChanges();

    findButtonByText(fixture, 'Save')?.click();
    fixture.detectChanges();

    expect(storeMock.createIr).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('app-dynamic-section')).toBeNull();
  });

  it('adding a casing row grows the section FormArray while Casing is being edited', async () => {
    await setup();
    const editBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Edit Casing"]');
    editBtn.click();
    fixture.detectChanges();

    findButtonByText(fixture, 'Add Casing')?.click();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.rpg__row');
    expect(rows.length).toBe(1);
  });

  it('shows Submit for Review while the record is still draft', async () => {
    await setup({ status: 'draft' });
    expect(findButtonByText(fixture, 'Submit for Review')).toBeTruthy();
  });

  it('hides Submit for Review once the record is approved', async () => {
    await setup({ status: 'approved' });
    expect(findButtonByText(fixture, 'Submit for Review')).toBeFalsy();
  });

  it('Submit for Review calls store.submitIrForReview directly (no re-save first)', async () => {
    await setup({ status: 'in-progress' });
    findButtonByText(fixture, 'Submit for Review')?.click();

    expect(storeMock.createIr).not.toHaveBeenCalled();
    expect(storeMock.submitIrForReview).toHaveBeenCalledTimes(1);
  });

  it('editing a section on an already-submitted record saves it back into in-progress', async () => {
    await setup({ status: 'approved' });
    const editBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Edit Wellbore Details"]');
    editBtn.click();
    fixture.detectChanges();

    findButtonByText(fixture, 'Save')?.click();
    fixture.detectChanges();

    const [payload] = storeMock.createIr.mock.calls[0];
    expect(payload.status).toBe('in-progress');
  });
});
