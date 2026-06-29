import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatabaseInfoComponent } from './database-info.component';
import { ActiveWwellStore } from '../store/active-wwell.store';

const activeWwellStoreMock = {
  databaseInfo: jest.fn(() => null),
  selectedWell: jest.fn(() => null),
};

describe('DatabaseInfoComponent', () => {
  let component: DatabaseInfoComponent;
  let fixture: ComponentFixture<DatabaseInfoComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DatabaseInfoComponent],
      providers: [{ provide: ActiveWwellStore, useValue: activeWwellStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isEditingDepthLabel starts false', () => {
    expect((component as unknown as { isEditingDepthLabel: () => boolean }).isEditingDepthLabel()).toBe(false);
  });

  it('startEditDepthLabel sets editing to true', () => {
    (component as unknown as { startEditDepthLabel: () => void }).startEditDepthLabel();
    expect((component as unknown as { isEditingDepthLabel: () => boolean }).isEditingDepthLabel()).toBe(true);
  });

  it('depthSectionLabel defaults to "Depth & Formation"', () => {
    expect((component as unknown as { depthSectionLabel: () => string }).depthSectionLabel()).toBe('Depth & Formation');
  });
});
