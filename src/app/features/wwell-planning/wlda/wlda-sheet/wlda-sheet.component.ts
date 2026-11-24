import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WldaLetterView } from '@models/wwell-planning/wlda.model';
import {
  WLDA_DISTRIBUTION_PLACEHOLDER,
  WLDA_FORM_NUMBER,
  WLDA_FORM_TITLE,
  WLDA_TO_LINE,
  WLDA_WORKFLOW_COLUMNS,
  WLDA_WORKFLOW_PLACEHOLDER,
} from '../wlda.config';

/**
 * The Aramco Form 6208 "Well Location & Drilling Approval" sheet, read-only: it renders whatever the
 * form beside it holds (or a saved letter). Cells with no table column stay blank like the paper form.
 */
@Component({
  selector: 'app-wlda-sheet',
  standalone: true,
  imports: [DatePipe, MatIconModule],
  templateUrl: './wlda-sheet.component.html',
  styleUrl: './wlda-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WldaSheetComponent {
  readonly view = input.required<WldaLetterView>();

  protected readonly formTitle = WLDA_FORM_TITLE;
  protected readonly formNumber = WLDA_FORM_NUMBER;
  protected readonly toLine = WLDA_TO_LINE;
  protected readonly workflowColumns = WLDA_WORKFLOW_COLUMNS;
  protected readonly workflowPlaceholder = WLDA_WORKFLOW_PLACEHOLDER;
  protected readonly distributionPlaceholder = WLDA_DISTRIBUTION_PLACEHOLDER;
  protected readonly today = new Date().toISOString();

  protected orDash(value: string): string {
    return value.trim() || '—';
  }
}
