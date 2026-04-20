import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormationTopsAndCasingComponent } from './formation-tops-and-casing.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { createMockWellStore } from '../testing/mock-well-store';

describe('FormationTopsAndCasingComponent', () => {
  let component: FormationTopsAndCasingComponent;
  let fixture: ComponentFixture<FormationTopsAndCasingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationTopsAndCasingComponent],
      providers: [
        { provide: WellStore, useValue: createMockWellStore() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormationTopsAndCasingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
