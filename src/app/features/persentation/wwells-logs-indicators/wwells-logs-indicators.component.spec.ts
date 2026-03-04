import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WwellsLogsIndicatorsComponent } from './wwells-logs-indicators.component';

describe('WwellsLogsIndicatorsComponent', () => {
  let component: WwellsLogsIndicatorsComponent;
  let fixture: ComponentFixture<WwellsLogsIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WwellsLogsIndicatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WwellsLogsIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
