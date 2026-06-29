import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormationTopsAndCasingComponent } from './formation-tops-and-casing.component';
import { ActiveWwellStore } from '../store/active-wwell.store';

const activeWwellStoreMock = {
  allFormationTops: jest.fn(() => []),
};

describe('FormationTopsAndCasingComponent', () => {
  let component: FormationTopsAndCasingComponent;
  let fixture: ComponentFixture<FormationTopsAndCasingComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [FormationTopsAndCasingComponent],
      providers: [{ provide: ActiveWwellStore, useValue: activeWwellStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(FormationTopsAndCasingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('columnDefs has 5 columns', () => {
    expect(component.columnDefs.length).toBe(5);
  });
});
