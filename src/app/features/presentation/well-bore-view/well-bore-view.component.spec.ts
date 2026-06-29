import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { WellBoreViewComponent } from './well-bore-view.component';

@Component({
  standalone: true,
  imports: [WellBoreViewComponent],
  template: `<app-well-bore-view [diagramData]="null" [animTrigger]="0" />`,
})
class TestHostComponent {}

describe('WellBoreViewComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create the host', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
