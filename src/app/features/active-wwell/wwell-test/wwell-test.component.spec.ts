import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellTestComponent } from './wwell-test.component';

describe('WwellTestComponent', () => {
  let component: WwellTestComponent;
  let fixture: ComponentFixture<WwellTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WwellTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
