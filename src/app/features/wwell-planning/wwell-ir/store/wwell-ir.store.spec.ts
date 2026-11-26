import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { WWELL_SAVE_DELAY_MS } from '@models/wwell-planning/wwell-planning-loading.constants';
import { SapService } from '@services/sap/sap.service';
import { S3Service } from '@services/s3/s3.service';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { buildIntegratedRequirementFromPayload } from '../wwell-ir-form/wwell-ir-draft.util';
import { WwellIrBulkSavePayload } from '../wwell-ir-form/wwell-ir-payload.model';
import {
  WWELL_IR_SAP_PROCESS_ID,
  buildSapWorkflowTitle,
  WWELL_IR_SAP_RECALL_POLL_MAX_ATTEMPTS,
  WWELL_IR_SAP_RECALL_POLL_MS,
  WWELL_IR_SAP_SCENARIO_ID,
  WWELL_IR_SAP_WF_STATUS_IN_PROGRESS,
} from '../wwell-ir-sap.config';
import { WwellIrLetterPdfService } from '../wwell-ir-letter-pdf.service';
import { WwellIrService } from '../wwell-ir.service';
import { WwellIrStore } from './wwell-ir.store';

/** Lets the letter PDF's blob → base64 read (FileReader) finish, which fake timers don't drive. */
const settleAsyncWork = () => new Promise<void>(resolve => jest.requireActual('timers').setTimeout(resolve, 20));

const serviceMock = {
  createIr: jest.fn(),
  downloadLetterPdf: jest.fn(),
  getIrDetailBlocks: jest.fn(),
  getIrs: jest.fn(),
  getNextSapWorkflowSeq: jest.fn(),
  updateIrSapWorkflow: jest.fn(),
};

const sapServiceMock = {
  trigger: jest.fn(),
  getWorkflowStatus: jest.fn(),
  recall: jest.fn(),
};

const s3ServiceMock = {
  store: jest.fn(),
  fetch: jest.fn(),
};

const letterPdfMock = {
  buildLetterPdf: jest.fn(),
};

const authStoreMock = {
  networkId: jest.fn(() => 'junedalam'),
};

function buildPayload(): CreateIntegratedRequirementPayload {
  return {
    status: 'in-progress',
    requestReference: {
      linkedRequestId: null,
      client: 'BI-12',
      supportingBusiness: 'Agriculture',
      wellName: 'HAIL-500',
      targetAquifer: 'Saq',
      targetDepthFt: 510,
      surfaceElevationFtAsl: 980,
      coordinates: '27.5114°N, 41.7208°E',
    },
    formationTops: [],
    topsRemarks: null,
    casing: [],
    programDetails: {
      completionType: '',
      completion: 'Screened',
      openHoleSizeIn: null,
      linerSizeIn: null, linerDepthFt: null,
      acidization: '',
      transmission: '',
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
    },
    contacts: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: null },
    offsetWells: [],
    offsetWellsRemarks: null,
    hydrogeology: { aquifer: 'Saq', estimatedTdsPpm: 1200, h2sPpm: 5, estimatedPumpDepthFt: 150 },
    testProgram: { testType: 'pump-test', estimatedRateGpm: 350, estimatedWaterLevelFt: 95 },
  };
}

function buildIrBulkPayload(): WwellIrBulkSavePayload {
  return [
    {
      table: 'exad_gwd_ir_header',
      data: [
        {
          action: 'INSERT',
          ir_seq: null,
          prewap_seq: null,
          ltr_no: null,
          screen: '',
          sampling: null,
          logging: null,
          tops_remarks: null,
          publish_dt: null,
          publish_flg: 'N',
          curr_flg: 'Y',
          publish_by: null,
          cont_geologist: 101,
          sub_cont_geologist: null,
          water_remarks: null,
          gen_remarks: null,
          completion: 'Screened',
          cmpl_type: null,
          acidization: null,
          trns_type: null,
          dt_rmks: null,
          mud_rmks: null,
          test_type: 'pump-test',
          flow_rmks: null,
          dev_pump_test: null,
        },
      ],
    },
    { table: 'exad_gwd_ir_casing', data: null },
    { table: 'exad_gwd_ir_hydrogeology', data: null },
    { table: 'exad_gwd_ir_tops', data: null },
    { table: 'exad_gwd_ir_water', data: null },
    { table: 'exad_gwd_well_design', data: null },
  ];
}

describe('WwellIrStore - createIr', () => {
  let store: InstanceType<typeof WwellIrStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // createIr no longer trusts a client-side echo (see its own doc comment in WwellIrStore) — an
    // empty detail response here means "nothing extra to merge," so `irs()` ends up exactly what
    // buildIntegratedRequirementFromPayload alone would build, matching most of these assertions.
    serviceMock.getIrDetailBlocks.mockReturnValue(of([]));
    serviceMock.updateIrSapWorkflow.mockReturnValue(of(undefined));
    TestBed.configureTestingModule({
      providers: [
        WwellIrStore,
        { provide: WwellIrService, useValue: serviceMock },
        { provide: SapService, useValue: sapServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: WwellIrLetterPdfService, useValue: letterPdfMock },
        { provide: AuthStore, useValue: authStoreMock },
      ],
    });
    store = TestBed.inject(WwellIrStore);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('inserts the confirmed record — waits out the real follow-up GET', () => {
    serviceMock.createIr.mockReturnValue(of(9001));

    store.createIr(buildPayload(), buildIrBulkPayload());
    // createIr's request is wrapped in delay(WWELL_SAVE_DELAY_MS) — see WwellIrStore — so its own
    // "creatingIr" flag stays true for at least that long even against this instant mock response.
    jest.advanceTimersByTime(WWELL_SAVE_DELAY_MS);

    expect(serviceMock.createIr).toHaveBeenCalledWith(buildIrBulkPayload());
    expect(serviceMock.getIrDetailBlocks).toHaveBeenCalledWith(9001);
    // The follow-up GET's merge also stamps whether the stored remarks still carry legacy HTML (they don't here).
    expect(store.irs()).toEqual([
      {
        ...buildIntegratedRequirementFromPayload(buildPayload(), { id: 'IR-9001', code: 'IR-9001', irSeq: 9001 }),
        hasLegacyMarkup: false,
      },
    ]);
    expect(store.creatingIr()).toBe(false);
    expect(store.createIrError()).toBeNull();
  });

  /** Attachments are real files fetched per ir_seq (loadIrAttachments), never part of a save — so a
   *  freshly created record starts with none until that separate fetch resolves. */
  it('stamps a brand-new record as Draft (no workflow id yet) before reading it back', () => {
    serviceMock.createIr.mockReturnValue(of(9001));

    store.createIr(buildPayload(), buildIrBulkPayload());
    jest.advanceTimersByTime(WWELL_SAVE_DELAY_MS);

    expect(serviceMock.updateIrSapWorkflow).toHaveBeenCalledWith(9001, null, 'Draft');
  });

  it('starts a newly created record with no attachments', () => {
    serviceMock.createIr.mockReturnValue(of(9001));

    store.createIr(buildPayload(), buildIrBulkPayload());
    jest.advanceTimersByTime(WWELL_SAVE_DELAY_MS);

    expect(store.irs()[0].attachments).toEqual([]);
  });

  it('sets createIrError on failure and clears the creating flag', () => {
    serviceMock.createIr.mockReturnValue(throwError(() => new Error('Network down')));

    store.createIr(buildPayload(), buildIrBulkPayload());

    // delay() only defers next/complete notifications, not errors — see WwellIrStore's own note
    // on createIr — so the error path settles synchronously, with no timer to advance.
    expect(store.creatingIr()).toBe(false);
    expect(store.createIrError()).toBe('Network down');
    expect(serviceMock.getIrDetailBlocks).not.toHaveBeenCalled();
  });

  it('surfaces a distinct error and leaves irs untouched when the save succeeds but the follow-up GET fails', () => {
    serviceMock.createIr.mockReturnValue(of(9001));
    serviceMock.getIrDetailBlocks.mockReturnValue(throwError(() => new Error('timeout')));

    store.createIr(buildPayload(), buildIrBulkPayload());
    jest.advanceTimersByTime(WWELL_SAVE_DELAY_MS);

    expect(store.irs()).toEqual([]);
    expect(store.creatingIr()).toBe(false);
    // The backend did confirm this ir_seq, so it's still remembered — a resave must UPDATE, not
    // re-INSERT under a new row, even though `irs` couldn't be refreshed this time.
    expect(store.draftIrSeq()).toBe(9001);
    expect(store.createIrError()).toContain('refresh');
  });

  it('remembers the returned ir_seq — WwellIrComponent.createNewIr() reads this to select the just-created draft', () => {
    serviceMock.createIr.mockReturnValue(of(9001));

    store.createIr(buildPayload(), buildIrBulkPayload());
    jest.advanceTimersByTime(WWELL_SAVE_DELAY_MS);

    expect(store.draftIrSeq()).toBe(9001);
  });
});

function buildIntegratedRequirement(overrides: Partial<IntegratedRequirement> = {}): IntegratedRequirement {
  return {
    id: 'IR-9001',
    code: 'IR-9001',
    irSeq: 9001,
    updatedDate: '2026-01-01',
    status: 'in-progress',
    requestReference: {
      linkedRequestId: null,
      client: 'BI-12',
      supportingBusiness: 'Agriculture',
      wellName: 'HAIL-500',
      targetAquifer: 'Saq',
      targetDepthFt: 510,
      surfaceElevationFtAsl: 980,
      coordinates: '27.5114°N, 41.7208°E',
    },
    formationTops: [],
    topsRemarks: null,
    casing: [],
    programDetails: {
      completionType: '',
      completion: 'Screened',
      openHoleSizeIn: null,
      linerSizeIn: null, linerDepthFt: null,
      acidization: '',
      transmission: '',
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
    },
    contacts: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: null },
    offsetWells: [],
    offsetWellsRemarks: null,
    hydrogeology: { aquifer: 'Saq', estimatedTdsPpm: 1200, h2sPpm: 5, estimatedPumpDepthFt: 150 },
    testProgram: { testType: 'pump-test', estimatedRateGpm: 350, estimatedWaterLevelFt: 95 },
    attachments: [
      {
        slot: 'location-map',
        objectKey: 'ir-attachments/ir-9001/location-map/test-uuid',
        label: 'Location Map',
        fileName: 'location-map.pdf',
        sizeBytes: 1024,
        contentType: 'application/pdf',
      },
    ],
    chain: [],
    sapWfId: null,
    sapWfStatusText: null,
    ...overrides,
  };
}

describe('WwellIrStore - submitIrForReview', () => {
  let store: InstanceType<typeof WwellIrStore>;

  const emptyWorkflowStatus = {
    header: {
      process_name: 'Geological Operations',
      initiator_id: 'ALANMX10',
      requester_id: 'ALANMX10',
      date_initiated: '2026-09-15',
      time_initiated: '11:30:35',
      wf_status: null,
      wf_status_text: 'In Process',
    },
    remarks: [],
    reject_remarks: [],
    approval_chain: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    authStoreMock.networkId.mockReturnValue('junedalam');
    s3ServiceMock.fetch.mockReturnValue(of({ content: 'QUJD', content_type: 'application/pdf' }));
    letterPdfMock.buildLetterPdf.mockResolvedValue(new Blob(['ABC'], { type: 'application/pdf' }));
    sapServiceMock.getWorkflowStatus.mockReturnValue(of(emptyWorkflowStatus));
    TestBed.configureTestingModule({
      providers: [
        WwellIrStore,
        { provide: WwellIrService, useValue: serviceMock },
        { provide: SapService, useValue: sapServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: WwellIrLetterPdfService, useValue: letterPdfMock },
        { provide: AuthStore, useValue: authStoreMock },
      ],
    });
    store = TestBed.inject(WwellIrStore);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /** Seeds `irs` through the store's own public read path, so the status assertions below run
   *  against a record the store actually holds rather than a detached object. */
  function seedIrs(ir: IntegratedRequirement): void {
    serviceMock.getIrs.mockReturnValue(of([ir]));
    store.loadIrs();
  }

  it('refuses to submit, and never calls SAP, when no Location Map is attached', async () => {
    const ir = buildIntegratedRequirement({ status: 'in-progress', irSeq: 9001, attachments: [] });

    store.submitIrForReview(ir);
    await settleAsyncWork();

    expect(serviceMock.getNextSapWorkflowSeq).not.toHaveBeenCalled();
    expect(sapServiceMock.trigger).not.toHaveBeenCalled();
    expect(store.sapTriggerError()).toBe('Attach a Location Map before submitting for review.');
  });

  it('runs the three steps in order — mint id, trigger SAP, record the "in progress" placeholder, then read SAP\'s real status', async () => {
    const ir = buildIntegratedRequirement({ status: 'in-progress', irSeq: 9001 });
    seedIrs(ir);
    serviceMock.getNextSapWorkflowSeq.mockReturnValue(of(6));
    sapServiceMock.trigger.mockReturnValue(of({ message: 'Agents were successfully resolved' }));
    serviceMock.updateIrSapWorkflow.mockReturnValue(of(undefined));
    sapServiceMock.getWorkflowStatus.mockReturnValue(of({ header: { wf_status_text: 'Pending Approval' }, approval_chain: [] }));

    store.submitIrForReview(ir);
    await settleAsyncWork();

    const sentRequest = sapServiceMock.trigger.mock.calls[0][0];
    expect(letterPdfMock.buildLetterPdf).toHaveBeenCalledWith(
      expect.objectContaining({ code: ir.code, sapWfId: 6, sapWfStatusText: WWELL_IR_SAP_WF_STATUS_IN_PROGRESS, chain: [] }),
      true,
    );
    expect(sentRequest.attachment_files).toEqual([
      { file_name: `${ir.code}-letter.pdf`, b64: 'QUJD' },
      { file_name: 'location-map.pdf', b64: 'QUJD' },
    ]);
    expect(sentRequest.workflow_title).toBe(`[${environment.production ? '' : 'TEST-'}${ir.code}] Integrated Requirement for ${ir.requestReference.wellName}`);
    expect(sentRequest).toMatchObject({
      process_id: WWELL_IR_SAP_PROCESS_ID,
      scenario_id: WWELL_IR_SAP_SCENARIO_ID,
      initiator_network_id: 'junedalam',
      requester_network_id: 'junedalam',
      workflow_id: '6',
      body: [],
    });
    expect(sapServiceMock.getWorkflowStatus).toHaveBeenCalledWith(WWELL_IR_SAP_PROCESS_ID, 6);
    expect(serviceMock.updateIrSapWorkflow).toHaveBeenCalledWith(9001, 6, WWELL_IR_SAP_WF_STATUS_IN_PROGRESS);
    expect(store.irs()[0].status).toBe('submit-for-review');
    expect(store.irs()[0].sapWfId).toBe(6);
    expect(store.irs()[0].sapWfStatusText).toBe('Pending Approval');
    expect(serviceMock.updateIrSapWorkflow).toHaveBeenLastCalledWith(9001, 6, 'Pending Approval');
    expect(store.updatingIrStatus()).toBe(false);
    expect(store.sapTriggerError()).toBeNull();
  });

  it('syncApprovalStatus asks SAP for the current workflow, and falls back to the record when SAP is unreachable', async () => {
    const ir = buildIntegratedRequirement({ irSeq: 9001, sapWfId: 3, sapWfStatusText: 'In Progress' });
    sapServiceMock.getWorkflowStatus.mockReturnValue(throwError(() => new Error('SAP unreachable')));

    await expect(store.syncApprovalStatus(ir)).resolves.toBe(ir);
    expect(sapServiceMock.getWorkflowStatus).toHaveBeenCalledWith(WWELL_IR_SAP_PROCESS_ID, 3);

    sapServiceMock.getWorkflowStatus.mockClear();
    const neverSubmitted = buildIntegratedRequirement({ irSeq: 9002, sapWfId: null });
    await expect(store.syncApprovalStatus(neverSubmitted)).resolves.toBe(neverSubmitted);
    expect(sapServiceMock.getWorkflowStatus).not.toHaveBeenCalled();
  });

  it('prints the NEW workflow, not the previous rejected one, in the letter sent on a resubmission', async () => {
    const staleStep = { role: 'Manager', name: 'Old Approver', status: 'Rejected', date: '2026-11-01' };
    const ir = buildIntegratedRequirement({
      status: 'in-progress',
      irSeq: 9001,
      sapWfId: 3,
      sapWfStatusText: 'Rejected',
      chain: [staleStep] as unknown as IntegratedRequirement['chain'],
    });
    seedIrs(ir);
    serviceMock.getNextSapWorkflowSeq.mockReturnValue(of(7));
    sapServiceMock.trigger.mockReturnValue(of({ message: 'Agents were successfully resolved' }));
    serviceMock.updateIrSapWorkflow.mockReturnValue(of(undefined));

    store.submitIrForReview(ir);
    await settleAsyncWork();

    expect(letterPdfMock.buildLetterPdf).toHaveBeenCalledWith(
      expect.objectContaining({ sapWfId: 7, sapWfStatusText: WWELL_IR_SAP_WF_STATUS_IN_PROGRESS, chain: [] }),
      true,
    );
    expect(store.irs()[0].sapWfId).toBe(7);
    expect(store.irs()[0].chain).toEqual([]);
  });

  /** The header is stamped only for a workflow SAP actually accepted — a failed trigger must leave
   *  sap_wf_id/sap_wf_status untouched rather than recording a workflow that does not exist in SAP. */
  it('does not touch the IR header at all when the SAP trigger fails', async () => {
    const ir = buildIntegratedRequirement({ status: 'in-progress', irSeq: 9001 });
    seedIrs(ir);
    serviceMock.getNextSapWorkflowSeq.mockReturnValue(of(6));
    sapServiceMock.trigger.mockReturnValue(throwError(() => new Error('SAP unreachable')));

    store.submitIrForReview(ir);
    await settleAsyncWork();

    expect(serviceMock.updateIrSapWorkflow).not.toHaveBeenCalled();
    expect(store.irs()[0].status).toBe('in-progress');
    expect(store.sapTriggerError()).toBe('SAP unreachable');
    expect(store.updatingIrStatus()).toBe(false);
  });

  it('surfaces the SAP 422 validation detail message instead of a generic HTTP failure text', async () => {
    const ir = buildIntegratedRequirement({ status: 'in-progress', irSeq: 9001 });
    serviceMock.getNextSapWorkflowSeq.mockReturnValue(of(6));
    sapServiceMock.trigger.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            error: { detail: [{ loc: ['body', 0], msg: 'field required', type: 'missing', input: '', ctx: {} }] },
          }),
      ),
    );

    store.submitIrForReview(ir);
    await settleAsyncWork();

    expect(store.sapTriggerError()).toBe('field required');
  });

  /** A refused or offline connection still arrives as an HttpErrorResponse, but with status 0 and
   *  `error` holding the transport's own TypeError rather than the backend's ApiResponse envelope.
   *  Reproduced live by pointing sapServiceUrl at a dead port: the toast read "Failed to fetch",
   *  which tells the user nothing about what failed or what to do. */
  it('names the unreachable service when the SAP call never reached a server', async () => {
    const ir = buildIntegratedRequirement({ status: 'in-progress', irSeq: 9001 });
    serviceMock.getNextSapWorkflowSeq.mockReturnValue(of(6));
    sapServiceMock.trigger.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 0,
            statusText: 'Unknown Error',
            error: new TypeError('Failed to fetch'),
          }),
      ),
    );

    store.submitIrForReview(ir);
    await settleAsyncWork();

    expect(store.sapTriggerError()).toBe('Unable to reach the server. Check your connection and try again.');
  });

  /** An unsaved draft has no ir_seq, so there would be nothing to record the SAP outcome against
   *  — the guard must refuse before SAP is called, not after. */
  it('refuses to submit an IR that has never been saved, without calling SAP', async () => {
    const ir = buildIntegratedRequirement({ status: 'draft', irSeq: null });

    store.submitIrForReview(ir);
    await settleAsyncWork();

    expect(serviceMock.getNextSapWorkflowSeq).not.toHaveBeenCalled();
    expect(sapServiceMock.trigger).not.toHaveBeenCalled();
    expect(serviceMock.updateIrSapWorkflow).not.toHaveBeenCalled();
    expect(store.sapTriggerError()).toContain('Save the integrated requirement');
    expect(store.updatingIrStatus()).toBe(false);
  });

  it('never calls the SAP trigger when minting a workflow id fails', async () => {
    const ir = buildIntegratedRequirement({ status: 'in-progress', irSeq: 9001 });
    serviceMock.getNextSapWorkflowSeq.mockReturnValue(throwError(() => new Error('sequence exhausted')));

    store.submitIrForReview(ir);
    await settleAsyncWork();

    expect(sapServiceMock.trigger).not.toHaveBeenCalled();
    expect(serviceMock.updateIrSapWorkflow).not.toHaveBeenCalled();
    expect(store.sapTriggerError()).toBe('sequence exhausted');
    expect(store.updatingIrStatus()).toBe(false);
  });

  it('reports a distinct error, and does not mark the record submitted, when recording the outcome fails', async () => {
    const ir = buildIntegratedRequirement({ status: 'in-progress', irSeq: 9001 });
    seedIrs(ir);
    serviceMock.getNextSapWorkflowSeq.mockReturnValue(of(6));
    sapServiceMock.trigger.mockReturnValue(of({ message: 'Agents were successfully resolved' }));
    serviceMock.updateIrSapWorkflow.mockReturnValue(throwError(() => new Error('header locked')));

    store.submitIrForReview(ir);
    await settleAsyncWork();

    expect(store.irs()[0].status).toBe('in-progress');
    expect(store.sapTriggerError()).toBe('header locked');
    expect(store.updatingIrStatus()).toBe(false);
  });
});

describe('WwellIrStore - recallIr', () => {
  let store: InstanceType<typeof WwellIrStore>;

  // Real DELETE /recall response shape confirmed live: a bare acknowledgement, not a workflow-status
  // payload — SAP's own current status/chain only ever comes from a separate GET /display call.
  const recallAck = { message: 'Request 11054 recalled successfully' };

  const recalledWorkflowStatus = {
    header: {
      process_name: 'Geological Operations',
      initiator_id: 'ALAMMX10',
      requester_id: 'ALAMMX10',
      date_initiated: '2026-09-16',
      time_initiated: '08:28:57',
      wf_status: 'RCAL',
      wf_status_text: 'Recalled',
    },
    remarks: [{ remark_by: 'ALAMMX10', remarks: '***** by Mohammad Juned Alam ( EASD-BATCH )' }],
    reject_remarks: [],
    approval_chain: [
      {
        level: '01',
        received_date: '2026-09-16',
        received_time: '08:29:01',
        approver_network_id: null,
        approver_name: 'Mohammad Juned Alam',
        approver_title: 'Initiator',
        approver_category: 'Reviewer',
        response_date: '0000-00-00',
        response_time: '00:00:00',
        response: null,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authStoreMock.networkId.mockReturnValue('junedalam');
    TestBed.configureTestingModule({
      providers: [
        WwellIrStore,
        { provide: WwellIrService, useValue: serviceMock },
        { provide: SapService, useValue: sapServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: WwellIrLetterPdfService, useValue: letterPdfMock },
        { provide: AuthStore, useValue: authStoreMock },
      ],
    });
    store = TestBed.inject(WwellIrStore);
  });

  /** Seeds `irs` through the store's own public read path, so the status assertions below run
   *  against a record the store actually holds rather than a detached object. */
  function seedIrs(ir: IntegratedRequirement): void {
    serviceMock.getIrs.mockReturnValue(of([ir]));
    store.loadIrs();
  }

  it('calls SAP recall under the existing workflow id, then fetches the real status and chain via a follow-up GET', async () => {
    const ir = buildIntegratedRequirement({ status: 'submit-for-review', irSeq: 9001, sapWfId: 6, sapWfStatusText: WWELL_IR_SAP_WF_STATUS_IN_PROGRESS });
    seedIrs(ir);
    sapServiceMock.recall.mockReturnValue(of(recallAck));
    sapServiceMock.getWorkflowStatus.mockReturnValue(of(recalledWorkflowStatus));
    serviceMock.updateIrSapWorkflow.mockReturnValue(of(undefined));

    jest.useFakeTimers();
    store.recallIr(ir);
    jest.advanceTimersByTime(WWELL_IR_SAP_RECALL_POLL_MS);
    jest.useRealTimers();

    expect(sapServiceMock.recall).toHaveBeenCalledWith(WWELL_IR_SAP_PROCESS_ID, 6, 'junedalam');
    // The recall response is a bare ack with no status of its own — the real status/chain only ever
    // comes from a separate GET /display call, made under the same existing workflow id.
    expect(sapServiceMock.getWorkflowStatus).toHaveBeenCalledWith(WWELL_IR_SAP_PROCESS_ID, 6);
    // A recalled workflow is gone for good, so once SAP confirms it the IR is reset to an unsubmitted Draft:
    // workflow id cleared, status "Draft" written to the header, approval chain dropped.
    expect(serviceMock.updateIrSapWorkflow).toHaveBeenCalledWith(9001, null, 'Draft');
    expect(store.irs()[0].sapWfId).toBeNull();
    expect(store.irs()[0].sapWfStatusText).toBe('Draft');
    expect(store.irs()[0].chain).toEqual([]);
    expect(store.recallingIr()).toBe(false);
    expect(store.sapRecallError()).toBeNull();
  });

  it('refuses to recall an IR with no SAP workflow, without calling SAP', async () => {
    const ir = buildIntegratedRequirement({ status: 'in-progress', irSeq: 9001, sapWfId: null });

    store.recallIr(ir);

    expect(sapServiceMock.recall).not.toHaveBeenCalled();
    expect(store.sapRecallError()).toContain('has not been submitted for review');
    expect(store.recallingIr()).toBe(false);
  });

  it('does not touch the IR header at all when the SAP recall itself fails', async () => {
    const ir = buildIntegratedRequirement({ status: 'submit-for-review', irSeq: 9001, sapWfId: 6, sapWfStatusText: WWELL_IR_SAP_WF_STATUS_IN_PROGRESS });
    seedIrs(ir);
    sapServiceMock.recall.mockReturnValue(throwError(() => new Error('SAP unreachable')));

    store.recallIr(ir);

    expect(sapServiceMock.getWorkflowStatus).not.toHaveBeenCalled();
    expect(store.irs()[0].sapWfStatusText).toBe(WWELL_IR_SAP_WF_STATUS_IN_PROGRESS);
    expect(store.sapRecallError()).toBe('SAP unreachable');
    expect(store.recallingIr()).toBe(false);
  });

  it('reports a distinct error, and leaves the record\'s status untouched, when the follow-up status fetch fails', async () => {
    const ir = buildIntegratedRequirement({ status: 'submit-for-review', irSeq: 9001, sapWfId: 6, sapWfStatusText: WWELL_IR_SAP_WF_STATUS_IN_PROGRESS });
    seedIrs(ir);
    sapServiceMock.recall.mockReturnValue(of(recallAck));
    // A non-Error rejection so `sapErrorMessage` falls through to the caller's own fallback text
    // instead of an `.message` it happens to carry — isolates this assertion to the fallback path.
    sapServiceMock.getWorkflowStatus.mockReturnValue(throwError(() => ({})));

    jest.useFakeTimers();
    store.recallIr(ir);
    jest.advanceTimersByTime(WWELL_IR_SAP_RECALL_POLL_MS * WWELL_IR_SAP_RECALL_POLL_MAX_ATTEMPTS);
    jest.useRealTimers();

    expect(store.irs()[0].sapWfStatusText).toBe(WWELL_IR_SAP_WF_STATUS_IN_PROGRESS);
    expect(store.sapRecallError()).toBe('Workflow recalled, but failed to refresh its latest status');
    expect(store.recallingIr()).toBe(false);
  });
});

describe('WwellIrStore - recallIr polling', () => {
  it('keeps polling until SAP reports Recalled, showing each status read, then stops and clears the spinner', async () => {
    jest.clearAllMocks();
    authStoreMock.networkId.mockReturnValue('junedalam');
    TestBed.configureTestingModule({
      providers: [
        WwellIrStore,
        { provide: WwellIrService, useValue: serviceMock },
        { provide: SapService, useValue: sapServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: WwellIrLetterPdfService, useValue: letterPdfMock },
        { provide: AuthStore, useValue: authStoreMock },
      ],
    });
    const store = TestBed.inject(WwellIrStore);
    const ir = buildIntegratedRequirement({ status: 'submit-for-review', irSeq: 9001, sapWfId: 6, sapWfStatusText: WWELL_IR_SAP_WF_STATUS_IN_PROGRESS });
    serviceMock.getIrs.mockReturnValue(of([ir]));
    store.loadIrs();
    const statusWith = (text: string) => ({
      header: { process_name: 'x', initiator_id: 'a', requester_id: 'a', date_initiated: '2026-09-16', time_initiated: '08:28:57', wf_status: 'S', wf_status_text: text },
      remarks: [],
      reject_remarks: [],
      approval_chain: [],
    });
    sapServiceMock.recall.mockReturnValue(of({ message: 'ok' }));
    serviceMock.updateIrSapWorkflow.mockReturnValue(of(undefined));
    sapServiceMock.getWorkflowStatus
      .mockReturnValueOnce(of(statusWith('In Progress')))
      .mockReturnValueOnce(of(statusWith('In Progress')))
      .mockReturnValue(of(statusWith('Recalled')));

    jest.useFakeTimers();
    store.recallIr(ir);
    jest.advanceTimersByTime(WWELL_IR_SAP_RECALL_POLL_MS);
    expect(store.recallingIr()).toBe(true);
    expect(store.irs()[0].sapWfStatusText).toBe('In Progress');
    jest.advanceTimersByTime(WWELL_IR_SAP_RECALL_POLL_MS * 2);
    jest.useRealTimers();

    // Once SAP confirms the recall the IR goes back to being an unsubmitted Draft.
    expect(serviceMock.updateIrSapWorkflow).toHaveBeenCalledWith(9001, null, 'Draft');
    expect(store.irs()[0].sapWfStatusText).toBe('Draft');
    expect(store.irs()[0].sapWfId).toBeNull();
    expect(store.recallingIr()).toBe(false);
    expect(sapServiceMock.getWorkflowStatus).toHaveBeenCalledTimes(3);
  });
});

describe('WwellIrStore - loadIrDetail (approval timeline)', () => {
  let store: InstanceType<typeof WwellIrStore>;

  const workflowStatusWithOneApprovedStep = {
    header: {
      process_name: 'Geological Operations',
      initiator_id: 'ALANMX10',
      requester_id: 'ALANMX10',
      date_initiated: '2026-09-15',
      time_initiated: '11:30:35',
      wf_status: 'COMPLETE',
      wf_status_text: 'Approved',
    },
    remarks: [],
    reject_remarks: [],
    approval_chain: [
      {
        level: '01',
        received_date: '2026-09-15',
        received_time: '11:30:39',
        approver_network_id: null,
        approver_name: 'Mohammad Juned Alam',
        approver_title: 'Initiator',
        approver_category: 'Reviewer',
        response_date: '2026-09-15',
        response_time: '11:45:00',
        response: 'APPROVED',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        WwellIrStore,
        { provide: WwellIrService, useValue: serviceMock },
        { provide: SapService, useValue: sapServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: WwellIrLetterPdfService, useValue: letterPdfMock },
        { provide: AuthStore, useValue: authStoreMock },
      ],
    });
    store = TestBed.inject(WwellIrStore);
  });

  function seedIrs(ir: IntegratedRequirement): void {
    serviceMock.getIrs.mockReturnValue(of([ir]));
    store.loadIrs();
  }

  /** Only the detail fetch's exad_gwd_ir_header block carries sap_wf_id (see
   *  wwell-ir-summary.mapper.ts) — this is what lets loadIrDetail resolve a real one to look SAP
   *  up by. */
  it('looks up the real SAP workflow once a detail fetch resolves a sap_wf_id', async () => {
    const ir = buildIntegratedRequirement({ irSeq: 9001, sapWfId: null });
    seedIrs(ir);
    serviceMock.getIrDetailBlocks.mockReturnValue(
      of([{ table: 'exad_gwd_ir_header', data: [{ sap_wf_id: 11033 }] }]),
    );
    sapServiceMock.getWorkflowStatus.mockReturnValue(of(workflowStatusWithOneApprovedStep));

    store.loadIrDetail(9001);

    expect(sapServiceMock.getWorkflowStatus).toHaveBeenCalledWith(WWELL_IR_SAP_PROCESS_ID, 11033);
    expect(store.irs()[0].sapWfId).toBe(11033);
    expect(store.irs()[0].chain).toEqual([{ role: 'Initiator', name: 'Mohammad Juned Alam', status: 'approved', date: '2026-09-15' }]);
    expect(store.irApprovalTimelineLoading()).toBe(false);
  });

  /** An IR that has never been through Submit for Review has no SAP workflow to look up — calling
   *  SAP with nothing to ask about would be meaningless (and, per the mock's own validation, a
   *  422). */
  it('never calls SAP display for an IR with no sap_wf_id', async () => {
    const ir = buildIntegratedRequirement({ irSeq: 9001, sapWfId: null });
    seedIrs(ir);
    serviceMock.getIrDetailBlocks.mockReturnValue(of([{ table: 'exad_gwd_ir_header', data: [{}] }]));

    store.loadIrDetail(9001);

    expect(sapServiceMock.getWorkflowStatus).not.toHaveBeenCalled();
    expect(store.irs()[0].sapWfId).toBeNull();
    expect(store.irApprovalTimelineLoading()).toBe(false);
  });

  it('surfaces a SAP display failure as irApprovalTimelineError without touching the chain', async () => {
    const ir = buildIntegratedRequirement({ irSeq: 9001, sapWfId: null, chain: [{ role: 'Existing', name: 'Someone', status: 'pending', date: null }] });
    seedIrs(ir);
    serviceMock.getIrDetailBlocks.mockReturnValue(
      of([{ table: 'exad_gwd_ir_header', data: [{ sap_wf_id: 11033 }] }]),
    );
    sapServiceMock.getWorkflowStatus.mockReturnValue(throwError(() => new Error('SAP unreachable')));

    store.loadIrDetail(9001);

    expect(store.irApprovalTimelineError()).toBe('SAP unreachable');
    expect(store.irs()[0].chain).toEqual([{ role: 'Existing', name: 'Someone', status: 'pending', date: null }]);
  });

  /** The manual refresh action (Approval Workflow sidebar / detail header) — lets the UI pull
   *  SAP's real current status/chain for an already-selected record on demand, replacing whatever
   *  submitIrForReview's local "in progress" placeholder (or a stale earlier fetch) last left. */
  it('refreshIrApprovalStatus re-fetches SAP display and updates status/chain for a known sapWfId', async () => {
    const ir = buildIntegratedRequirement({ irSeq: 9001, sapWfId: 11033, status: 'submit-for-review', sapWfStatusText: 'In Progress' });
    seedIrs(ir);
    sapServiceMock.getWorkflowStatus.mockReturnValue(of(workflowStatusWithOneApprovedStep));

    store.refreshIrApprovalStatus(9001, 11033);

    expect(sapServiceMock.getWorkflowStatus).toHaveBeenCalledWith(WWELL_IR_SAP_PROCESS_ID, 11033);
    expect(store.irs()[0].sapWfStatusText).toBe('Approved');
    expect(store.irs()[0].chain).toEqual([{ role: 'Initiator', name: 'Mohammad Juned Alam', status: 'approved', date: '2026-09-15' }]);
  });

  it('refreshIrApprovalStatus is a no-op for a record with no sapWfId — nothing in SAP to ask about', async () => {
    const ir = buildIntegratedRequirement({ irSeq: 9001, sapWfId: null });
    seedIrs(ir);

    store.refreshIrApprovalStatus(9001, null);

    expect(sapServiceMock.getWorkflowStatus).not.toHaveBeenCalled();
  });
});

describe('buildSapWorkflowTitle', () => {
  it('adds the TEST- marker inside the brackets on a non-production build', () => {
    expect(buildSapWorkflowTitle('IR-11018', 'AMYL_801', false)).toBe('[TEST-IR-11018] Integrated Requirement for AMYL_801');
  });

  it('has no marker in production', () => {
    expect(buildSapWorkflowTitle('IR-11018', 'AMYL_801', true)).toBe('[IR-11018] Integrated Requirement for AMYL_801');
  });
});
