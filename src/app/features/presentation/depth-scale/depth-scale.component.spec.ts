import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { DepthScaleComponent } from './depth-scale.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';

describe('DepthScaleComponent', () => {
  let component: DepthScaleComponent;
  let fixture: ComponentFixture<DepthScaleComponent>;
  let componentRef: ComponentRef<DepthScaleComponent>;
  const mockWellStore = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepthScaleComponent],
      providers: [{ provide: WellStore, useValue: mockWellStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(DepthScaleComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set required signal inputs
    componentRef.setInput('totalDepth', 1000);
    componentRef.setInput('animTrigger', 1);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // 🌟 JEST SPECIFIC ADDITION: Snapshot Test
  it('should match the saved DOM snapshot', () => {
    // This tells Jest to save the HTML output to a __snapshots__ folder.
    // On future runs, it will compare the new HTML to the saved file.
    expect(fixture.nativeElement).toMatchSnapshot();
  });

  it('should draw the depth scale SVG elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const svg: SVGSVGElement | null = compiled.querySelector('svg');
    expect(svg).toBeTruthy();

    if (svg) {
      const gElements = svg.querySelectorAll('g');
      expect(gElements.length).toBeGreaterThan(0);

      const axisTitle = svg.querySelector('.axis-title');
      expect(axisTitle).toBeTruthy();
      expect(axisTitle?.textContent).toContain('Depth');

      const axisLine = svg.querySelector('.axis-line');
      expect(axisLine).toBeTruthy();

      const totalDepthLabel = svg.querySelector('.total-depth-label');
      expect(totalDepthLabel).toBeTruthy();
    }
  });

  it('should update scale on trigger change', () => {
    componentRef.setInput('totalDepth', 2000);
    componentRef.setInput('animTrigger', 2);
    fixture.detectChanges();

    // Verify updating inputs does not break the component
    const compiled = fixture.nativeElement as HTMLElement;
    const labels = compiled.querySelectorAll('.tick-label');
    expect(labels.length).toBeGreaterThan(0);
  });
});
