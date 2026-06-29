import { ComponentFixture, TestBed } from '@angular/core/testing';
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
};

const rbacStoreMock = {
  hasPermission: jest.fn(() => false),
  isLoaded: jest.fn(() => true),
};

const activeWellViewServiceMock = {
  createOrUpdateGwdWellTest: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
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
});
