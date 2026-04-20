import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ActiveWwellViewComponent } from './active-wwell-view.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { createMockWellStore } from '../testing/mock-well-store';

describe('ActiveWwellViewComponent', () => {
  let component: ActiveWwellViewComponent;
  let fixture: ComponentFixture<ActiveWwellViewComponent>;
  let mockStore: ReturnType<typeof createMockWellStore>;

  beforeEach(async () => {
    mockStore = createMockWellStore();

    await TestBed.configureTestingModule({
      imports: [ActiveWwellViewComponent],
      providers: [
        { provide: WellStore, useValue: mockStore },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({}),
            },
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveWwellViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
