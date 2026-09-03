import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { ActionConfirmDialogComponent, ActionConfirmDialogData, ActionConfirmDialogResult } from './action-confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ActionConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  /** Plain yes/no gate — 'confirm' maps to `true`, everything else (Cancel, Esc, backdrop click,
   *  or a Discard click on a caller that opted into `discardLabel`) maps to `false`. */
  open(data: ActionConfirmDialogData): Observable<boolean> {
    return this.openWithResult(data).pipe(map(result => result === 'confirm'));
  }

  /** Three-way variant for callers that pass `discardLabel` (e.g. the "unsaved changes" prompt —
   *  Save / Discard / Stay). Safe to use for plain two-button dialogs too — `discardLabel` just
   *  never fires without a Discard button to click. */
  openWithResult(data: ActionConfirmDialogData): Observable<ActionConfirmDialogResult> {
    return this.dialog
      .open(ActionConfirmDialogComponent, { data, disableClose: false, width: '420px' })
      .afterClosed()
      .pipe(map((result: ActionConfirmDialogResult | undefined) => result ?? 'cancel'));
  }
}
