import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActiveWwellDocsViewerComponent } from './active-wwell-docs-viewer.component';
import { PresentationStore } from '../store/presentation.store';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
import { PresDocsService } from '@services/pres-docs.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RbacStore } from '@store/rbac/rbac.store';

const presentationStoreMock = {
  selectedWell: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
  selectedDate: jest.fn(() => ''),
  isLoaded: jest.fn(() => false),
};

const wellDocsStoreMock = {
  isLoading: jest.fn(() => false),
  listLoading: jest.fn(() => false),
  listError: jest.fn((): string | null => null),
  categories: jest.fn(() => []),
  docNames: jest.fn((): string[] => []),
  docsByCategory: jest.fn(() => ({})),
  totalCount: jest.fn(() => 0),
  totalDocCount: jest.fn(() => 0),
  loadDocs: jest.fn(),
  loadDocList: jest.fn(),
  removeSingleFile: jest.fn(),
};

const presDocsServiceMock = {
  fetchDocs: jest.fn(),
  uploadDocs: jest.fn(),
  removeDoc: jest.fn(),
};

const dialogMock = { open: jest.fn() };

const rbacStoreMock = {
  hasPermission: jest.fn(() => false),
};

describe('ActiveWwellDocsViewerComponent', () => {
  let component: ActiveWwellDocsViewerComponent;
  let fixture: ComponentFixture<ActiveWwellDocsViewerComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ActiveWwellDocsViewerComponent, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: PresentationStore, useValue: presentationStoreMock },
        { provide: WellDocsStore, useValue: wellDocsStoreMock },
        { provide: PresDocsService, useValue: presDocsServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: RbacStore, useValue: rbacStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveWwellDocsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hides the delete action when user lacks delete permission', () => {
    rbacStoreMock.hasPermission.mockReturnValue(false);
    wellDocsStoreMock.docNames.mockReturnValue(['report.pdf']);
    (component as unknown as { collapsed: { set: (v: boolean) => void } }).collapsed.set(false);
    fixture.detectChanges();

    const deleteBtn = fixture.debugElement.query(By.css('.action-btn--delete'));
    expect(deleteBtn).toBeNull();
    expect(rbacStoreMock.hasPermission).toHaveBeenCalledWith('presentations', 'delete');
  });

  it('shows the delete action when user has GWD_admin delete permission', () => {
    rbacStoreMock.hasPermission.mockReturnValue(true);
    wellDocsStoreMock.docNames.mockReturnValue(['report.pdf']);
    (component as unknown as { collapsed: { set: (v: boolean) => void } }).collapsed.set(false);
    fixture.detectChanges();

    const deleteBtn = fixture.debugElement.query(By.css('.action-btn--delete'));
    expect(deleteBtn).not.toBeNull();
  });
});
