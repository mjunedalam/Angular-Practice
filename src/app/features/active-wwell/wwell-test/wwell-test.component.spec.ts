import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WwellTestComponent } from './wwell-test.component';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWellViewService } from '@core/services/active-well-view.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { RbacStore } from '@store/rbac/rbac.store';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const activeWwellStoreMock = {
  wwellTest: jest.fn(() => null),
  selectedWell: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
  selectedDate: jest.fn(() => ''),
  isDetailsLoading: jest.fn(() => false),
  aquifers: jest.fn(() => []),
  wellData: jest.fn(() => null),
  refreshWellDetail: jest.fn(),
};

const rbacStoreMock = {
  hasPermission: jest.fn(() => false),
  isLoaded: jest.fn(() => true),
};

const activeWellViewServiceMock = {
  createOrUpdateGwdWellTest: jest.fn(() => of({})),
  createOrUpdateGwdDailyRemark: jest.fn(() => of({})),
  deleteGwdWellTest: jest.fn(() => of({})),
};

const notificationServiceMock = {
  show: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('WwellTestComponent', () => {
  let component: WwellTestComponent;
  let fixture: ComponentFixture<WwellTestComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellTestComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ActiveWwellStore, useValue: activeWwellStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
        { provide: ActiveWellViewService, useValue: activeWellViewServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        ActiveWwellUiStore,
        ActiveWwellFormService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isFlowTest starts false', () => {
    expect((component as unknown as { isFlowTest: () => boolean }).isFlowTest()).toBe(false);
  });

  it('tooltipVisible starts false', () => {
    expect((component as unknown as { tooltipVisible: () => boolean }).tooltipVisible()).toBe(false);
  });

  // Matrix: docs/plan/wwell-test-fields-validation.md
  describe('createOrUpdateActiveWwell — Required/Optional matrix enforcement', () => {
    function setMode(isFlow: boolean): void {
      (component as unknown as { isFlowTest: { set: (v: boolean) => void } }).isFlowTest.set(isFlow);
      fixture.detectChanges();
    }

    function publish(): void {
      (component as unknown as { isPublished: { set: (v: boolean) => void } }).isPublished.set(true);
      fixture.detectChanges();
    }

    function fillValidPump(): void {
      component.form.patchValue({
        epANum: 'EP1',
        testStaDt: '2026-01-01',
        rsvrCd: 'AQ1',
        duration: 10,
        rpm: 100,
        temp: 25,
        hydH2sCnc: 5,
        hydProdRt: 50,
        hydPmpDpth: 200,
      });
    }

    function fillValidFlow(): void {
      component.form.patchValue({
        epANum: 'EP1',
        testStaDt: '2026-01-01',
        rsvrCd: 'AQ1',
        duration: 10,
        temp: 25,
        hydH2sCnc: 5,
        hydProdRt: 50,
      });
    }

    const missingDetailsWarning = () =>
      notificationServiceMock.warn.mock.calls.some(([msg]) => String(msg).includes('Missing required details'));

    beforeEach(() => {
      component.formService.drillingRemarksForm.patchValue({ status: 'Active', area: 'Zone 1' });
    });

    it('PUMP: does not warn about missing details when every required field is filled and optional fields are empty', () => {
      setMode(false);
      publish();
      fillValidPump();

      component.createOrUpdateActiveWwell();

      expect(missingDetailsWarning()).toBe(false);
    });

    it.each(['rsvrCd', 'temp', 'hydH2sCnc', 'hydProdRt', 'duration', 'rpm', 'hydPmpDpth'])(
      'PUMP: warns about missing required details when "%s" is empty',
      (field) => {
        setMode(false);
        publish();
        fillValidPump();
        component.form.get(field)?.setValue(null);

        component.createOrUpdateActiveWwell();

        expect(missingDetailsWarning()).toBe(true);
      },
    );

    it.each(['wtrSaTdsCnc', 'statWlvl', 'dyncWlvl', 'testerNetworkId', 'siwhp', 'fwhp'])(
      'PUMP: does not warn about missing details when optional field "%s" is empty',
      (field) => {
        setMode(false);
        publish();
        fillValidPump();
        component.form.get(field)?.setValue(null);

        component.createOrUpdateActiveWwell();

        expect(missingDetailsWarning()).toBe(false);
      },
    );

    it('FLOW: does not warn about missing details when every required field is filled and RPM/Pump Depth/SIWHP/FWHP are empty', () => {
      setMode(true);
      publish();
      fillValidFlow();

      component.createOrUpdateActiveWwell();

      expect(missingDetailsWarning()).toBe(false);
    });

    it.each(['rsvrCd', 'temp', 'hydH2sCnc', 'hydProdRt', 'duration'])(
      'FLOW: warns about missing required details when "%s" is empty',
      (field) => {
        setMode(true);
        publish();
        fillValidFlow();
        component.form.get(field)?.setValue(null);

        component.createOrUpdateActiveWwell();

        expect(missingDetailsWarning()).toBe(true);
      },
    );

    it.each(['wtrSaTdsCnc', 'siwhp', 'fwhp', 'testerNetworkId'])(
      'FLOW: does not warn about missing details when optional field "%s" is empty',
      (field) => {
        setMode(true);
        publish();
        fillValidFlow();
        component.form.get(field)?.setValue(null);

        component.createOrUpdateActiveWwell();

        expect(missingDetailsWarning()).toBe(false);
      },
    );

    it('warns about invalid Conducted By format even though the field itself is optional', () => {
      setMode(false);
      publish();
      fillValidPump();
      component.form.get('testerNetworkId')?.setValue('abc!123');

      component.createOrUpdateActiveWwell();

      expect(notificationServiceMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('comma-separated list of Network IDs'),
        expect.anything(),
      );
    });

    it('does not warn at all when Conducted By holds a valid comma-separated list', () => {
      setMode(false);
      publish();
      fillValidPump();
      component.form.get('testerNetworkId')?.setValue('abc123,def456');

      component.createOrUpdateActiveWwell();

      expect(notificationServiceMock.warn).not.toHaveBeenCalled();
    });
  });
});
