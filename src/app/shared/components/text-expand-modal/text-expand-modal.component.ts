import { Component, inject } from '@angular/core';
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
  protected readonly data = inject<TextExpandData>(MAT_DIALOG_DATA);
  protected readonly localFc: FormControl;
  protected readonly isEditable: boolean;

  constructor() {
    const initialValue = this.data.control?.value ?? this.data.text ?? '';
    this.isEditable = !this.data.readonly && !!this.data.control;
    this.localFc = new FormControl(initialValue);
  }
}
