import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveWwellDocsViewerComponent } from './active-wwell-docs-viewer.component';
import { PresentationStore } from '../store/presentation.store';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
import { PresDocsService } from '@services/pres-docs.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const presentationStoreMock = {
  selectedWell: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
  selectedDate: jest.fn(() => ''),
  isLoaded: jest.fn(() => false),
};

const wellDocsStoreMock = {
  isLoading: jest.fn(() => false),
  listLoading: jest.fn(() => false),
  categories: jest.fn(() => []),
  docNames: jest.fn(() => []),
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
});
