import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickedFormationTopsComponent } from './picked-formation-tops.component';

describe('PickedFormationTopsComponent', () => {
  let component: PickedFormationTopsComponent;
  let fixture: ComponentFixture<PickedFormationTopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickedFormationTopsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickedFormationTopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
