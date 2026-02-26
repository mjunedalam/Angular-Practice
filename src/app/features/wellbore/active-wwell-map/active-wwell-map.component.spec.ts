import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveWwellMapComponent } from './active-wwell-map.component';

describe('ActiveWwellMapComponent', () => {
  let component: ActiveWwellMapComponent;
  let fixture: ComponentFixture<ActiveWwellMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveWwellMapComponent]
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
