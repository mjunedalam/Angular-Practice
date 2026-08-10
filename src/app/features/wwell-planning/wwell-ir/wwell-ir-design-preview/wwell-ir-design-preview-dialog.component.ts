import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  IntegratedRequirementCasingRow,
  IntegratedRequirementFormationTop,
} from '@models/wwell-planning/wwell-planning.model';
import { WwellIrDesignPreviewComponent } from './wwell-ir-design-preview.component';

/** Passed as signal getters (not snapshotted values) so the enlarged view stays live if the
 * underlying form keeps changing while the dialog is open. */
export interface WwellIrDesignPreviewDialogData {
  readonly formationTops: () => readonly IntegratedRequirementFormationTop[];
  readonly casing: () => readonly IntegratedRequirementCasingRow[];
  readonly surfaceElevationFtAsl: () => number | null;
  readonly targetDepthFt: () => number;
  readonly wellName: () => string | null;
  readonly wellCode: () => string | null;
  readonly preparedDate: () => string | null;
}

@Component({
  selector: 'app-wwell-ir-design-preview-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule, WwellIrDesignPreviewComponent],
  templateUrl: './wwell-ir-design-preview-dialog.component.html',
  styleUrl: './wwell-ir-design-preview-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrDesignPreviewDialogComponent {
  protected readonly data = inject<WwellIrDesignPreviewDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<WwellIrDesignPreviewDialogComponent>);

  protected close(): void {
    this.dialogRef.close();
  }
}
