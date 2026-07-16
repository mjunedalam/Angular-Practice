import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Wellbore3DViewComponent } from './wellbore-3d-view.component';

@Component({
  standalone: true,
  imports: [Wellbore3DViewComponent],
  template: `<app-wellbore-3d-view [diagramData]="null" [animTrigger]="0" />`,
})
class TestHostComponent {}

describe('Wellbore3DViewComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create the host without touching WebGL when there is no diagram data', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
