import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveWwellViewComponent } from './active-wwell-view.component';

describe('ActiveWwellViewComponent', () => {
  let component: ActiveWwellViewComponent;
  let fixture: ComponentFixture<ActiveWwellViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveWwellViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveWwellViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
