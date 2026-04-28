import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WellBoreViewComponent } from './well-bore-view.component';
import { ComponentRef } from '@angular/core';
import { WellboreDiagramData } from 'src/app/core/models/well-design/wellbore-diagram.model';
import { ICasingIR } from 'src/app/shared/models/wwell/casing-ir.model';
import { ITopsIR } from 'src/app/shared/models/wwell/tops-ir.model';
import { IHydrogeologyIR } from 'src/app/shared/models/wwell/hydrogeology-ir.model';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';

describe('WellBoreViewComponent', () => {
  let component: WellBoreViewComponent;
  let fixture: ComponentFixture<WellBoreViewComponent>;
  let componentRef: ComponentRef<WellBoreViewComponent>;
  const mockDrillingDataStore = {};

  const mockDiagramData: WellboreDiagramData = {
    wellName: 'Test Well',
    totalDepth: 10000,
    currentDepth: 8000,
    casings: [
      { csgSize: '20', csgType: 'Conductor', csgDepth: 500, csgRemarks: 'Cond' } as ICasingIR,
      { csgSize: '13.375', csgType: 'Surface', csgDepth: 2500, csgRemarks: 'Surf' } as ICasingIR,
    ],
    geologicTops: [
      { stLongCd: 'FM1', planTvdDepth: 1000 } as ITopsIR,
      { stLongCd: 'FM2', planTvdDepth: 3000 } as ITopsIR,
    ],
    hydrogeology: {
      estStaticWaterLevel: 1500,
      estTargetAquifier: 'FM2',
      flowType: 'N',
    } as unknown as IHydrogeologyIR,    prewap: null,
    rigActivity: null,
    mudCirculation: [
      { depth: 1000, pct: 100 },
      { depth: 5000, pct: 50 },
    ],
    wellDesign: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, WellBoreViewComponent],
      providers: [{ provide: DrillingDataStore, useValue: mockDrillingDataStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(WellBoreViewComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    // Set required inputs
    componentRef.setInput('diagramData', mockDiagramData);
    componentRef.setInput('animTrigger', 1);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the SVG element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const svg = compiled.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBeDefined();
  });

  it('should render ground line and static chrome', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.ground-line')).toBeTruthy();
    expect(compiled.querySelector('.ground-label')?.textContent).toBe('Ground Level');
  });

  it('should render geologic tops from data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tops = compiled.querySelectorAll('.geo-top');
    // We have 2 mock tops
    expect(tops.length).toBe(2);
    expect(tops[0].textContent).toContain('FM1');
    expect(tops[1].textContent).toContain('FM2');
  });

  it('should identify the target aquifer with a special class', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const targetTop = compiled.querySelector('.geo-top--target');
    expect(targetTop).toBeTruthy();
    expect(targetTop?.textContent).toContain('FM2');
    expect(targetTop?.querySelector('.geo-target-band')).toBeTruthy();
  });

  it('should render casings as path elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const casings = compiled.querySelectorAll('path.casing');
    // We have 2 structural casings in mockup
    expect(casings.length).toBe(2);
  });

  it('should render casing labels correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const labels = compiled.querySelectorAll('.casing-label');
    expect(labels.length).toBe(2);
    expect(labels[0].textContent).toContain('20" Conductor @ 500');
    expect(labels[1].textContent).toContain('13.375" Surface @ 2,500');
  });

  it('should render water level line', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const waterLevel = compiled.querySelector('.water-level');
    expect(waterLevel).toBeTruthy();
    expect(waterLevel?.textContent).toContain('Static WL: 1,500 ft');
  });

  it('should render the depth arrow group', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.depth-arrow-group')).toBeTruthy();
    expect(compiled.querySelector('.depth-arrow-head')).toBeTruthy();
  });

  it('should update the view when diagramData or animTrigger changes', fakeAsync(() => {
    // Modify mock data
    const newData = { ...mockDiagramData, wellName: 'Updated Well', geologicTops: [] };
    componentRef.setInput('diagramData', newData);
    componentRef.setInput('animTrigger', 2);
    
    fixture.detectChanges();
    tick(); // allow effect to run
    
    const compiled = fixture.nativeElement as HTMLElement;
    // redrawn view should have 0 tops
    expect(compiled.querySelectorAll('.geo-top').length).toBe(0);
  }));
});
