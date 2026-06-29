import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  const dialogRefMock = { afterClosed: jest.fn(() => of(true)) };
  const dialogMock = { open: jest.fn(() => dialogRefMock) };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ConfirmDialogService,
        { provide: MatDialog, useValue: dialogMock },
      ],
    });
    service = TestBed.inject(ConfirmDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('open() returns observable that emits true when dialog confirmed', (done) => {
    service.open({ title: 'Test', rows: [] }).subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('open() returns observable that emits false when dialog cancelled', (done) => {
    dialogRefMock.afterClosed.mockReturnValue(of(false as boolean));
    service.open({ title: 'Test', rows: [] }).subscribe((result) => {
      expect(result).toBe(false);
      done();
    });
  });
});
