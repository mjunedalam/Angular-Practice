import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormationTopsAndCasingComponent } from './formation-tops-and-casing.component';

describe('FormationTopsAndCasingComponent', () => {
  let component: FormationTopsAndCasingComponent;
  let fixture: ComponentFixture<FormationTopsAndCasingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationTopsAndCasingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormationTopsAndCasingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
