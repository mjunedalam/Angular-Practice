import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveWwellViewComponent } from './active-wwell-view.component';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWellViewService } from '@core/services/active-well-view.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { RbacStore } from '@store/rbac/rbac.store';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

const activeWwellStoreMock = {
  selectedWell: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
  selectedDate: jest.fn(() => ''),
  uniqueWellNames: jest.fn(() => []),
  wellData: jest.fn(() => null),
  wellHeaderData: jest.fn(() => null),
  databaseInfo: jest.fn(() => null),
  operationSummary: jest.fn(() => null),
  wwellTest: jest.fn(() => null),
  allFormationTops: jest.fn(() => []),
  allCasingData: jest.fn(() => []),
  wellNames: jest.fn(() => []),
  pagedWellNames: jest.fn(() => []),
  isLoading: jest.fn(() => false),
  isDetailsLoading: jest.fn(() => false),
  isInitialLoading: jest.fn(() => false),
  hasError: jest.fn(() => false),
  errorMessage: jest.fn(() => ''),
  totalDepth: jest.fn(() => 0),
  status: jest.fn(() => null),
  area: jest.fn(() => null),
  loadWellList: jest.fn(),
  loadWellDetail: jest.fn(),
  selectWell: jest.fn(),
  setDate: jest.fn(),
  initialize: jest.fn(),
};

const rbacStoreMock = {
  hasPermission: jest.fn(() => false),
  isLoaded: jest.fn(() => true),
};

const activatedRouteMock = {
  paramMap: of({ get: () => null }),
  queryParamMap: of({ get: () => null }),
  snapshot: {
    queryParamMap: { get: () => null, getAll: () => [], has: () => false, keys: [] },
  },
};

const routerMock = { navigate: jest.fn() };
const dialogMock = { open: jest.fn() };

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

const activeWellViewServiceMock = {
  createOrUpdateGwdDailyRemark: jest.fn(),
  createOrUpdateGwdWellTest: jest.fn(),
};

describe('ActiveWwellViewComponent', () => {
  let component: ActiveWwellViewComponent;
  let fixture: ComponentFixture<ActiveWwellViewComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ActiveWwellViewComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ActiveWwellStore, useValue: activeWwellStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: ActiveWellViewService, useValue: activeWellViewServiceMock },
        ActiveWwellFormService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveWwellViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
