import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { normalizeStatusName } from '../active-wwell.helpers';

@Component({
  selector: 'app-add-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-status-dialog.component.html',
  styleUrl: './add-status-dialog.component.scss',
})
export class AddStatusDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AddStatusDialogComponent, string>);

  protected name = '';

  constructor(@Inject(MAT_DIALOG_DATA) data: { name?: string } | null) {
    this.name = data?.name ?? '';
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected save(): void {
    const normalized = normalizeStatusName(this.name);

    if (!normalized) {
      return;
    }

    this.dialogRef.close(normalized);
  }
}
