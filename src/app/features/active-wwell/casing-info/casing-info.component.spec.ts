import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CasingInfoComponent } from './casing-info.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { createMockWellStore } from '../testing/mock-well-store';

describe('CasingInfoComponent', () => {
  let component: CasingInfoComponent;
  let fixture: ComponentFixture<CasingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasingInfoComponent],
      providers: [
        { provide: WellStore, useValue: createMockWellStore() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CasingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
