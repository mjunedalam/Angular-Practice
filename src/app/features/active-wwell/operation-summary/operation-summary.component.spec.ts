import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationSummaryComponent } from './operation-summary.component';

describe('OperationSummaryComponent', () => {
  let component: OperationSummaryComponent;
  let fixture: ComponentFixture<OperationSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
