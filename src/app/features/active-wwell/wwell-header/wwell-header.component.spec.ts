import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellHeaderComponent } from './wwell-header.component';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { RbacStore } from '@store/rbac/rbac.store';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const activeWwellStoreMock = {
  wellHeaderData: jest.fn(() => null),
};

const rbacStoreMock = {
  hasPermission: jest.fn(() => false),
  isLoaded: jest.fn(() => true),
};

const dialogMock = { open: jest.fn() };

describe('WwellHeaderComponent', () => {
  let component: WwellHeaderComponent;
  let fixture: ComponentFixture<WwellHeaderComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellHeaderComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ActiveWwellStore, useValue: activeWwellStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
        { provide: MatDialog, useValue: dialogMock },
        ActiveWwellUiStore,
        ActiveWwellFormService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filteredStatusOptions returns all when query is empty', () => {
    const result = (component as unknown as { filteredStatusOptions: () => unknown[] }).filteredStatusOptions();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('canUpdate is false when rbac denies', () => {
    expect((component as unknown as { canUpdate: () => boolean }).canUpdate()).toBe(false);
  });

  it('openAddStatusDialog opens a dialog', () => {
    (component as unknown as { openAddStatusDialog: () => void }).openAddStatusDialog();
    expect(dialogMock.open).toHaveBeenCalled();
  });
});
