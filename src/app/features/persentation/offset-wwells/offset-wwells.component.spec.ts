import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffsetWwellsComponent } from './offset-wwells.component';

describe('OffsetWwellsComponent', () => {
  let component: OffsetWwellsComponent;
  let fixture: ComponentFixture<OffsetWwellsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffsetWwellsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffsetWwellsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
