import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveWwellMapComponent } from './active-wwell-map.component';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';

describe('ActiveWwellMapComponent', () => {
  let component: ActiveWwellMapComponent;
  let fixture: ComponentFixture<ActiveWwellMapComponent>;
  const mockDrillingDataStore = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveWwellMapComponent],
      providers: [{ provide: DrillingDataStore, useValue: mockDrillingDataStore }]
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
