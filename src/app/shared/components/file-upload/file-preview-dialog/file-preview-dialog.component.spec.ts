import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilePreviewDialogComponent } from './file-preview-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

Object.defineProperty(URL, 'createObjectURL', { value: jest.fn(() => 'blob:test'), writable: true });
Object.defineProperty(URL, 'revokeObjectURL', { value: jest.fn(), writable: true });

const dialogRefMock = { close: jest.fn() };
const testFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

describe('FilePreviewDialogComponent', () => {
  let component: FilePreviewDialogComponent;
  let fixture: ComponentFixture<FilePreviewDialogComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [FilePreviewDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: testFile },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilePreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('fileName should match the provided file name', () => {
    expect((component as unknown as { fileName: string }).fileName).toBe('test.pdf');
  });

  it('previewType should be pdf for pdf files', () => {
    expect((component as unknown as { previewType: string }).previewType).toBe('pdf');
  });
});
