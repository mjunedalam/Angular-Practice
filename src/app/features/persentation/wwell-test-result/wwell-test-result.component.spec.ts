import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WwellTestResultComponent } from './wwell-test-result.component';

describe('WwellTestResultComponent', () => {
  let component: WwellTestResultComponent;
  let fixture: ComponentFixture<WwellTestResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WwellTestResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WwellTestResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
