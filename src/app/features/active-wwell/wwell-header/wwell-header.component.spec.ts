import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellHeaderComponent } from './wwell-header.component';

describe('WwellHeaderComponent', () => {
  let component: WwellHeaderComponent;
  let fixture: ComponentFixture<WwellHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WwellHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
