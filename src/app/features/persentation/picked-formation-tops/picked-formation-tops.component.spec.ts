import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PickedFormationTopsComponent } from './picked-formation-tops.component';
import { WellStore } from '../../../core/store/well.store';
import { signal, WritableSignal } from '@angular/core';

describe('PickedFormationTopsComponent', () => {
  let component: PickedFormationTopsComponent;
  let fixture: ComponentFixture<PickedFormationTopsComponent>;
  let mockStore: {
    pickedFormations: WritableSignal<any[]>;
    isLoaded: WritableSignal<boolean>;
  };

  beforeEach(async () => {
    mockStore = {
      pickedFormations: signal([
        { formation: 'F1', depth: 1000, remarks: 'R1' },
        { formation: 'F2', depth: 2000, remarks: 'R2' }
      ]),
      isLoaded: signal(true),
    };

    await TestBed.configureTestingModule({
      imports: [PickedFormationTopsComponent],
      providers: [
        { provide: WellStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PickedFormationTopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize column definitions', () => {
    expect(component.columnDefs.length).toBe(3);
    expect(component.columnDefs[0].field).toBe('formation');
    expect(component.columnDefs[1].field).toBe('depth');
    expect(component.columnDefs[2].field).toBe('remarks');
  });

  it('should update grid rowData when store changes', fakeAsync(() => {
    const gridApiSpy = { setGridOption: jest.fn() };
    (component as any).gridApi = gridApiSpy;

    // Trigger effect
    mockStore.pickedFormations.set([{ formation: 'F3', depth: 3000, remarks: 'R3' }]);
    fixture.detectChanges();
    tick();

    expect(gridApiSpy.setGridOption).toHaveBeenCalledWith('rowData', expect.any(Array));
    expect(gridApiSpy.setGridOption.mock.calls[0][1][0].formation).toBe('F3');
  }));

  it('should handle onGridReady', () => {
    const gridApiSpy = { setGridOption: jest.fn() };
    const event = { api: gridApiSpy } as any;

    component.onGridReady(event);

    expect((component as any).gridApi).toBe(gridApiSpy);
    expect(gridApiSpy.setGridOption).toHaveBeenCalledWith('rowData', mockStore.pickedFormations());
  });

  it('should format depth value correctly', () => {
    const depthCol = component.columnDefs.find(c => c.field === 'depth');
    const formatter = depthCol?.valueFormatter as any;

    expect(formatter({ value: 1234 })).toBe('1,234');
    expect(formatter({ value: null })).toBe('—');
  });
});
