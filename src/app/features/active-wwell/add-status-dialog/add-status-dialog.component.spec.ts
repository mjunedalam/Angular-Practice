import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddStatusDialogComponent } from './add-status-dialog.component';

describe('AddStatusDialogComponent', () => {
  let component: AddStatusDialogComponent;
  let fixture: ComponentFixture<AddStatusDialogComponent>;
  const dialogRefMock = { close: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AddStatusDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { name: 'Existing' } },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pre-fills name from dialog data', () => {
    expect((component as unknown as { name: string }).name).toBe('Existing');
  });

  it('cancel() closes dialog without value', () => {
    (component as unknown as { cancel: () => void }).cancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith();
  });

  it('save() closes with normalized name', () => {
    (component as unknown as { name: string }).name = '  Active Well  ';
    (component as unknown as { save: () => void }).save();
    expect(dialogRefMock.close).toHaveBeenCalledWith('Active Well');
  });

  it('save() does not close when name is empty', () => {
    (component as unknown as { name: string }).name = '   ';
    (component as unknown as { save: () => void }).save();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
