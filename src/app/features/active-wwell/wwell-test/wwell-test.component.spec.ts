import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellTestComponent } from './wwell-test.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { createMockWellStore } from '../testing/mock-well-store';

describe('WwellTestComponent', () => {
  let component: WwellTestComponent;
  let fixture: ComponentFixture<WwellTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WwellTestComponent],
      providers: [
        { provide: WellStore, useValue: createMockWellStore() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
