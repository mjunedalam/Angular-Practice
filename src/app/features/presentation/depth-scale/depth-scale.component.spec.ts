import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DepthScaleComponent } from './depth-scale.component';
import { PresentationStore } from '../store/presentation.store';

const presentationStoreMock = {
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

@Component({
  standalone: true,
  imports: [DepthScaleComponent],
  template: `<app-depth-scale [totalDepth]="1000" [animTrigger]="0" />`,
})
class TestHostComponent {}

describe('DepthScaleComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    const el = fixture.debugElement.query(By.directive(DepthScaleComponent));
    expect(el).toBeTruthy();
  });
});
