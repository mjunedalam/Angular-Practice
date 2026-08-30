import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { ActionConfirmDialogComponent, ActionConfirmDialogData } from './action-confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ActionConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  open(data: ActionConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open(ActionConfirmDialogComponent, { data, disableClose: false, width: '420px' })
      .afterClosed()
      .pipe(map((result: boolean | undefined) => result === true));
  }
}
