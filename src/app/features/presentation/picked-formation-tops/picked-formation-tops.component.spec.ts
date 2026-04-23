import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PickedFormationTopsComponent } from './picked-formation-tops.component';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';
import { signal, WritableSignal } from '@angular/core';
import { ColDef, GridReadyEvent } from 'ag-grid-community';

interface PickedFormation {
  formation: string;
  depth: number;
  remarks: string;
}

interface GridApiLike {
  setGridOption: jest.Mock;
}

describe('PickedFormationTopsComponent', () => {
  let component: PickedFormationTopsComponent;
  let fixture: ComponentFixture<PickedFormationTopsComponent>;
  let mockStore: {
    pickedFormations: WritableSignal<PickedFormation[]>;
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
        { provide: DrillingDataStore, useValue: mockStore }
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
    const gridApiSpy: GridApiLike = { setGridOption: jest.fn() };
    Object.assign(component, { gridApi: gridApiSpy });

    // Trigger effect
    mockStore.pickedFormations.set([{ formation: 'F3', depth: 3000, remarks: 'R3' }]);
    fixture.detectChanges();
    tick();

    expect(gridApiSpy.setGridOption).toHaveBeenCalledWith('rowData', expect.any(Array));
    expect(gridApiSpy.setGridOption.mock.calls[0][1][0].formation).toBe('F3');
  }));

  it('should handle onGridReady', () => {
    const gridApiSpy: GridApiLike = { setGridOption: jest.fn() };
    const event = { api: gridApiSpy } as unknown as GridReadyEvent;

    component.onGridReady(event);

    expect((component as unknown as { gridApi: GridApiLike }).gridApi).toBe(gridApiSpy);
    expect(gridApiSpy.setGridOption).toHaveBeenCalledWith('rowData', mockStore.pickedFormations());
  });

  it('should format depth value correctly', () => {
    const depthCol = component.columnDefs.find((c: ColDef) => c.field === 'depth');
    const formatter = depthCol?.valueFormatter as (params: { value: number | null }) => string;

    expect(formatter?.({ value: 1234 })).toBe('1,234');
    expect(formatter?.({ value: null })).toBe('—');
  });
});
