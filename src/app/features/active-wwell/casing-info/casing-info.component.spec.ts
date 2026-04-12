import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CasingInfoComponent } from './casing-info.component';

describe('CasingInfoComponent', () => {
  let component: CasingInfoComponent;
  let fixture: ComponentFixture<CasingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasingInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CasingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
