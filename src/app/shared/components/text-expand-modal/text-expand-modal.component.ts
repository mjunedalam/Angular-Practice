import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface TextExpandData {
  title: string;
  text?: string;
  control?: AbstractControl;
  readonly?: boolean;
}

@Component({
  selector: 'app-text-expand-modal',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './text-expand-modal.component.html',
  styleUrl: './text-expand-modal.component.scss',
})
export class TextExpandModalComponent {
  protected readonly localFc: FormControl;
  protected readonly isEditable: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) protected readonly data: TextExpandData) {
    const initialValue = data.control?.value ?? data.text ?? '';
    this.isEditable = !data.readonly && !!data.control;
    this.localFc = new FormControl(initialValue);
  }
}
