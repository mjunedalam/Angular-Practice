import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveWwellDocsViewerComponent } from './active-wwell-docs-viewer.component';
import { WellStore } from 'src/app/core/store/well.store';
import { WellDocsStore } from './well-docs.store';
import { signal } from '@angular/core';

const mockWellStore = {
  selectedEpANum: signal<number | null>(null),
  selectedDate: signal(new Date()),
  wellDetails: signal(null),
};

const mockDocsStore = {
  docs: signal([]),
  selectedDoc: signal(null),
  loading: signal(false),
  error: signal(null),
  viewerOpen: signal(false),
  totalCount: signal(0),
  categories: signal([]),
  loadDocs: jest.fn(),
  openViewer: jest.fn(),
  closeViewer: jest.fn(),
};

describe('ActiveWwellDocsViewerComponent', () => {
  let fixture: ComponentFixture<ActiveWwellDocsViewerComponent>;
  let component: ActiveWwellDocsViewerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveWwellDocsViewerComponent],
      providers: [
        { provide: WellStore, useValue: mockWellStore },
        { provide: WellDocsStore, useValue: mockDocsStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveWwellDocsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty state when no docs and not loading', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.state-overlay--empty')).toBeTruthy();
  });

  it('docIcon returns correct icon for each type', () => {
    const icons: Record<string, string> = {
      PDF: 'picture_as_pdf',
      IMAGE: 'image',
      EXCEL: 'table_chart',
      WORD: 'article',
      OTHER: 'insert_drive_file',
    };
    for (const [type, icon] of Object.entries(icons)) {
      expect((component as any).docIcon(type)).toBe(icon);
    }
  });

  it('formatSize returns correct human-readable strings', () => {
    expect((component as any).formatSize(512)).toBe('512 B');
    expect((component as any).formatSize(2048)).toBe('2.0 KB');
    expect((component as any).formatSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });
});
