import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationSummaryComponent } from './operation-summary.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { createMockWellStore } from '../testing/mock-well-store';

describe('OperationSummaryComponent', () => {
  let component: OperationSummaryComponent;
  let fixture: ComponentFixture<OperationSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationSummaryComponent],
      providers: [
        { provide: WellStore, useValue: createMockWellStore() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
