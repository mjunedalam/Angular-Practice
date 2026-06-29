import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
import { PresDocsService } from '@services/pres-docs.service';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const wellDocsStoreMock = {
  isLoading: jest.fn(() => false),
  listLoading: jest.fn(() => false),
  docs: jest.fn(() => []),
  docNames: jest.fn(() => []),
  categories: jest.fn(() => []),
  docsByCategory: jest.fn(() => ({})),
  totalCount: jest.fn(() => 0),
  loadDocs: jest.fn(),
  loadDocList: jest.fn(),
  uploadDocs: jest.fn(),
  removeDoc: jest.fn(),
  removeSingleFile: jest.fn(),
};

const presDocsServiceMock = {
  getDocs: jest.fn(),
  uploadDocs: jest.fn(),
  removeDoc: jest.fn(),
};

const dialogMock = { open: jest.fn() };

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [FileUploadComponent, NoopAnimationsModule],
      providers: [
        { provide: WellDocsStore, useValue: wellDocsStoreMock },
        { provide: PresDocsService, useValue: presDocsServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('files signal should be empty initially', () => {
    expect((component as unknown as { files: () => unknown[] }).files()).toEqual([]);
  });

  it('isDragOver should be false initially', () => {
    expect((component as unknown as { isDragOver: () => boolean }).isDragOver()).toBe(false);
  });
});
