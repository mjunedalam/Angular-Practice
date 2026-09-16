import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SapService } from './sap.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { SapTriggerRequest, SapTriggerResponse, SapValidationError } from '@models/sap/sap-trigger.model';
import { SapWorkflowStatusResponse } from '@models/sap/sap-workflow-status.model';
import { SKIP_AUTH } from '@interceptors/auth.interceptor';
import { SKIP_AUTO_LOGOUT, SUPPRESS_GLOBAL_ERROR } from '@interceptors/error.interceptor';

describe('SapService', () => {
  let service: SapService;
  let httpMock: HttpTestingController;

  const request: SapTriggerRequest = {
    workflow_title: 'title',
    initiator_network_id: 'initiator',
    requester_network_id: 'requester',
    process_id: 'process',
    scenario_id: 'scenario',
    workflow_id: 'workflow',
    attachment_files: [{ file_name: 'file.pdf', b64: 'base64' }],
    body: [
      { card_type: 'info', message: 'info message', details_link: 'https://example.com/' },
      { card_type: 'warning', message: 'warning message' },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SapService,
        {
          provide: ExternalConfigService,
          useValue: {
            settings: {
              sapServiceUrl: 'https://sap.example.test',
            },
          },
        },
      ],
    });
    service = TestBed.inject(SapService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('posts the request body to /trigger with native_response=false', () => {
    // Arrange
    let result: SapTriggerResponse | undefined;

    // Act
    service.trigger(request).subscribe(res => (result = res));

    const req = httpMock.expectOne(
      r => r.url === 'https://sap.example.test/trigger' && r.method === 'POST',
    );
    expect(req.request.params.get('native_response')).toBe('false');
    expect(req.request.body).toEqual(request);
    req.flush({ message: 'Agents were successfully resolved' });

    // Assert
    expect(result?.message).toBe('Agents were successfully resolved');
  });

  /** SAP is a third party on a different origin — none of this app's own auth/session conventions
   *  apply to it. Regression test for a confirmed live failure: without these three context flags
   *  the request carried this app's own JWT to SAP, and a SAP 401 ran errorInterceptor's
   *  auto-logout branch, kicking the user out of AGWA entirely mid-submit. */
  it('opts the SAP call out of this app\'s auth token, auto-logout and global error toast', () => {
    // Act
    service.trigger(request).subscribe({ next: () => undefined, error: () => undefined });

    // Assert
    const req = httpMock.expectOne(r => r.url === 'https://sap.example.test/trigger');
    expect(req.request.context.get(SKIP_AUTH)).toBe(true);
    expect(req.request.context.get(SKIP_AUTO_LOGOUT)).toBe(true);
    expect(req.request.context.get(SUPPRESS_GLOBAL_ERROR)).toBe(true);
    req.flush({ message: 'Agents were successfully resolved' });
  });

  it('surfaces a 422 validation error response', () => {
    // Arrange
    const validationError: SapValidationError = {
      detail: [{ loc: ['body', 0], msg: 'field required', type: 'missing', input: '', ctx: {} }],
    };
    let error: SapValidationError | undefined;

    // Act
    service.trigger(request).subscribe({
      error: (err) => (error = err.error),
    });

    const req = httpMock.expectOne(
      r => r.url === 'https://sap.example.test/trigger' && r.method === 'POST',
    );
    req.flush(validationError, { status: 422, statusText: 'Unprocessable Entity' });

    // Assert
    expect(error).toEqual(validationError);
  });

  it('gets the workflow status from /display with process_id, wf_obj_id and native_response=false', () => {
    // Arrange
    const response: SapWorkflowStatusResponse = {
      header: {
        process_name: 'Geological Operations',
        initiator_id: 'ALANMX10',
        requester_id: 'ALANMX10',
        date_initiated: '2026-09-15',
        time_initiated: '11:30:35',
        wf_status: null,
        wf_status_text: 'In Process',
      },
      remarks: [{ remark_by: 'ALANMX10', remarks: 'note' }],
      reject_remarks: [],
      approval_chain: [],
    };
    let result: SapWorkflowStatusResponse | undefined;

    // Act
    service.getWorkflowStatus('1406', 11033).subscribe(res => (result = res));

    const req = httpMock.expectOne(
      r => r.url === 'https://sap.example.test/display' && r.method === 'GET',
    );
    expect(req.request.params.get('process_id')).toBe('1406');
    expect(req.request.params.get('wf_obj_id')).toBe('11033');
    expect(req.request.params.get('native_response')).toBe('false');
    req.flush(response);

    // Assert
    expect(result).toEqual(response);
  });

  /** Same third-party-origin reasoning as the /trigger opt-outs above, applied to the GET call. */
  it('opts the SAP display call out of this app\'s auth token, auto-logout and global error toast', () => {
    // Act
    service.getWorkflowStatus('1406', 11033).subscribe({ next: () => undefined, error: () => undefined });

    // Assert
    const req = httpMock.expectOne(r => r.url === 'https://sap.example.test/display');
    expect(req.request.context.get(SKIP_AUTH)).toBe(true);
    expect(req.request.context.get(SKIP_AUTO_LOGOUT)).toBe(true);
    expect(req.request.context.get(SUPPRESS_GLOBAL_ERROR)).toBe(true);
    req.flush({ header: {}, remarks: [], reject_remarks: [], approval_chain: [] });
  });
});
