import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { WellboreViewToggleComponent } from './wellbore-view-toggle.component';
import { PresentationStore } from '../store/presentation.store';

// The 2D branch now renders <app-depth-scale> (see wellbore-view-toggle.component.html), which
// injects PresentationStore — mocked the same way depth-scale.component.spec.ts does, since the
// component never actually reads from it (dead injection) but DI still needs a provider.
const presentationStoreMock = {
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

@Component({
  standalone: true,
  imports: [WellboreViewToggleComponent],
  template: `<app-wellbore-view-toggle [diagramData]="null" [animTrigger]="0" />`,
})
class TestHostComponent {}

describe('WellboreViewToggleComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create the host and default to the 2D view', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-well-bore-view'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-wellbore-3d-view'))).toBeFalsy();
  });

  it('should hide the 2D view and mark the 3D toggle active when clicked', () => {
    // The 3D view itself sits behind an `@defer` block (see wellbore-view-toggle.component.html)
    // so Three.js only download once the user actually asks for the 3D mode — that dynamic
    // import doesn't resolve deterministically under Jest, so this only asserts the synchronous
    // part of the switch (2D unmounting, toggle state). The 3D view itself renders in the browser.
    const toggle = fixture.debugElement.query(By.css('.wellbore-mode-btn--3d'));
    toggle.nativeElement.click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('app-well-bore-view'))).toBeFalsy();
    expect(toggle.nativeElement.getAttribute('aria-pressed')).toBe('true');
  });
});
