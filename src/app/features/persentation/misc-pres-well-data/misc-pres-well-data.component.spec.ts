import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscPresWellDataComponent } from './misc-pres-well-data.component';

describe('MiscPresWellDataComponent', () => {
  let component: MiscPresWellDataComponent;
  let fixture: ComponentFixture<MiscPresWellDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiscPresWellDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiscPresWellDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
