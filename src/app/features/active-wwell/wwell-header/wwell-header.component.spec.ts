import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellHeaderComponent } from './wwell-header.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { createMockWellStore } from '../testing/mock-well-store';

describe('WwellHeaderComponent', () => {
  let component: WwellHeaderComponent;
  let fixture: ComponentFixture<WwellHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WwellHeaderComponent],
      providers: [
        { provide: WellStore, useValue: createMockWellStore() },
        ActiveWwellUiStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
