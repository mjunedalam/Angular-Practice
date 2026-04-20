import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveWwellMapComponent } from './active-wwell-map.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';

describe('ActiveWwellMapComponent', () => {
  let component: ActiveWwellMapComponent;
  let fixture: ComponentFixture<ActiveWwellMapComponent>;
  const mockWellStore = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveWwellMapComponent],
      providers: [{ provide: WellStore, useValue: mockWellStore }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveWwellMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
