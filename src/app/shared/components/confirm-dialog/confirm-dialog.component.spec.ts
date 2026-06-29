import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  const dialogRefMock = { close: jest.fn() };
  const dialogData = {
    title: 'Delete item',
    rows: [{ label: 'Name', value: 'test-well' }],
    severity: 'warning' as const,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isEmail returns true for email addresses', () => {
    expect((component as unknown as { isEmail: (v: string) => boolean }).isEmail('user@example.com')).toBe(true);
  });

  it('isEmail returns false for non-email values', () => {
    expect((component as unknown as { isEmail: (v: string) => boolean }).isEmail('plain-value')).toBe(false);
  });

  it('confirm() closes dialog with true', () => {
    (component as unknown as { confirm: () => void }).confirm();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('cancel() closes dialog with false', () => {
    (component as unknown as { cancel: () => void }).cancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });
});
