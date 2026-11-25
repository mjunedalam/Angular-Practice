import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WldaLetter, WldaLetterView } from '@models/wwell-planning/wlda.model';
import { NotificationService } from '@shared/components/notification/notification.service';
import { ActionConfirmDialogService } from '@shared/components/action-confirm-dialog/action-confirm-dialog.service';
import { WwellApprovalPillComponent } from '../shared/wwell-approvals/wwell-approval-pill/wwell-approval-pill.component';
import { WwellApprovalWorkflowCardComponent } from '../shared/wwell-approvals/wwell-approval-workflow-card/wwell-approval-workflow-card.component';
import { isSapWorkflowTerminal } from '../wwell-ir/wwell-ir.config';
import { WldaStore } from './store/wlda.store';
import { WldaUploadDialogComponent } from './wlda-upload-dialog/wlda-upload-dialog.component';
import { WldaFormComponent } from './wlda-form/wlda-form.component';
import { WldaSheetComponent } from './wlda-sheet/wlda-sheet.component';
import { WLDA_STATUS_META } from './wlda.config';
import { downloadWldaPdf } from './wlda-pdf.util';
import { WLDA_EMPTY_DRAFT, draftOfLetter, statusOfLetter, viewOfDraft, viewOfLetter, wldaCode, wldaKey, wldaWellName } from './wlda.util';

@Component({
  selector: 'app-wlda',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatTooltipModule, WldaFormComponent, WldaSheetComponent, WwellApprovalWorkflowCardComponent, WwellApprovalPillComponent],
  templateUrl: './wlda.component.html',
  styleUrl: './wlda.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WldaComponent {
  protected readonly store = inject(WldaStore);
  private readonly confirmDialog = inject(ActionConfirmDialogService);
  private readonly notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  protected readonly searchTerm = signal('');
  protected readonly downloading = signal(false);
  protected readonly statusMeta = WLDA_STATUS_META;

  /** Sticky like the IR page: rows open in 'edit' until a row's eye icon (or the View toggle) switches to read-only. */
  protected readonly detailMode = signal<'view' | 'edit'>('edit');
  protected readonly viewTab = signal<'details' | 'letter'>('details');

  protected readonly rows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const letters = this.store.letters();
    if (!term) return letters;
    return letters.filter(letter => [wldaCode(letter.ltrId), wldaWellName(letter)].some(value => value.toLowerCase().includes(term)));
  });

  /** What the sheet shows: the draft while creating, the saved letter (with draft overrides) otherwise. */
  protected readonly view = computed<WldaLetterView | null>(() => {
    const draft = this.store.draft();
    const letter = this.store.selectedLetter();
    if (letter) return viewOfLetter(letter, this.store.storedAttachments(), draft, this.store.approvalChain());
    return draft ? viewOfDraft(draft, this.store.draftPlan()) : null;
  });

  /** What "changed" is measured against: the saved letter while editing, a blank draft while creating. */
  protected readonly baseline = computed(() => {
    const letter = this.store.selectedLetter();
    return letter ? draftOfLetter(letter) : WLDA_EMPTY_DRAFT;
  });

  /** Options of the "Link to Water Well" dropdown: every pre-well plan, labelled like the IR picker. */
  protected readonly linkOptions = computed(() =>
    this.store.prewaps().map(plan => ({ prewapSeq: plan.prewapSeq, label: wldaWellName(plan) || `Plan #${plan.prewapSeq}` })),
  );

  /** Known plans' field codes / well numbers, offered as suggestions so a typo can't leave Create disabled. */
  protected readonly fieldOptions = computed(() => [...new Set(this.store.prewaps().map(plan => (plan.wPrimHid ?? '').trim()).filter(Boolean))]);
  protected readonly wellNumberOptions = computed(() => {
    const field = this.store.draft()?.field.trim().toLowerCase() ?? '';
    return this.store
      .prewaps()
      .filter(plan => !field || (plan.wPrimHid ?? '').trim().toLowerCase() === field)
      .map(plan => (plan.wNum ?? '').trim())
      .filter(Boolean);
  });

  /** Set by the Back arrow so the auto-select below doesn't immediately reopen what was just closed. */
  private readonly deselected = signal(false);

  constructor() {
    // Like the IR page, opening WLDA lands on the first letter instead of an empty detail pane.
    effect(() => {
      if (this.deselected() || this.store.draft() || this.store.selectedKey() !== null) return;
      const first = this.rows()[0];
      if (first) untracked(() => this.open(wldaKey(first)));
    });
  }

  protected readonly canSave = computed(() => this.store.draftErrors().length === 0 && !this.store.saving());

  protected code(letter: WldaLetter): string {
    return wldaCode(letter.ltrId);
  }

  protected detailRows(view: WldaLetterView): readonly { label: string; value: string }[] {
    return [
      { label: 'Letter', value: view.code },
      { label: 'Status', value: this.statusMeta[view.status].label },
      { label: 'Field', value: view.field },
      { label: 'Well Number', value: view.wellNumber },
      { label: 'Well Type', value: view.wellType },
      { label: 'Reservoir', value: view.reservoir },
      { label: 'Total Depth', value: view.totalDepth },
      { label: 'GOSP / Area Plant', value: view.gosp },
      { label: 'Northing', value: view.north },
      { label: 'Easting', value: view.east },
      { label: 'UTM Zone', value: view.zone },
      { label: 'Remarks', value: view.remarks },
      { label: 'Attachments', value: view.attachments.map(file => file.name).join(', ') },
    ];
  }

  /** Title of the detail header: the typed well name while creating, the plan's well name for a saved letter. */
  protected readonly headline = computed(() => {
    const letter = this.store.selectedLetter();
    const typed = this.store.draft()?.waterWellName.trim() ?? '';
    return (letter ? wldaWellName(letter) : typed) || 'Untitled well';
  });

  protected wellLabel(letter: WldaLetter): string {
    return wldaWellName(letter) || 'Unnamed well';
  }

  protected status(letter: WldaLetter) {
    return this.statusMeta[statusOfLetter(letter)];
  }

  protected isActive(letter: WldaLetter): boolean {
    return wldaKey(letter) === this.store.selectedKey();
  }

  protected select(letter: WldaLetter): void {
    this.guardUnsaved(() => {
      this.deselected.set(false);
      this.open(wldaKey(letter));
    });
  }

  /** The row's eye icon: opens the letter read-only (Details / WLDA Letter tabs) and stays read-only for the next rows. */
  protected viewLetter(letter: WldaLetter): void {
    this.guardUnsaved(() => {
      this.deselected.set(false);
      this.detailMode.set('view');
      this.store.select(wldaKey(letter));
    });
  }

  /** The toolbar's View toggle: drop the draft and show the saved letter read-only. */
  protected showView(): void {
    this.guardUnsaved(() => {
      this.detailMode.set('view');
      this.store.discardDraft();
    });
  }

  protected showEdit(): void {
    this.detailMode.set('edit');
    this.store.startEdit();
  }

  private open(key: string): void {
    this.store.select(key);
    if (this.detailMode() === 'edit') this.store.startEdit();
  }

  protected newDraft(): void {
    this.guardUnsaved(() => {
      this.deselected.set(false);
      this.store.startDraft();
    });
  }

  /** Discard (create): leaves the draft, confirming first if it changed. */
  protected leaveDraft(): void {
    this.guardUnsaved(() => this.store.discardDraft());
  }

  /** Only a Draft or a rejected/recalled letter can be (re)submitted, and only once its edits are saved. */
  protected readonly canSubmit = computed(() => {
    const letter = this.store.selectedLetter();
    if (!letter || this.store.saving() || this.store.isDirty()) return false;
    const status = statusOfLetter(letter);
    return status === 'draft' || status === 'rejected';
  });

  /** Recall replaces Submit once SAP has the workflow, but only while it is still live (nothing left to pull back otherwise). */
  protected readonly canRecall = computed(() => {
    const letter = this.store.selectedLetter();
    return !!letter && letter.sapWfId != null && statusOfLetter(letter) === 'submitted' && !isSapWorkflowTerminal(letter.sapWfStatus);
  });

  /** What the shared Approval Workflow card renders: the live chain plus the workflow id (null = never submitted). */
  protected readonly approval = computed(() => ({ chain: this.store.approvalChain(), sapWfId: this.store.selectedLetter()?.sapWfId ?? null }));

  protected readonly hasWorkflow = computed(() => this.approval().sapWfId !== null);

  protected refreshApproval(): void {
    this.store.refreshApproval();
  }

  protected recall(): void {
    const letter = this.store.selectedLetter();
    if (!letter) return;
    this.confirmDialog
      .open({
        title: 'Recall this WLDA letter?',
        rows: [
          { label: 'Letter', value: wldaCode(letter.ltrId) },
          { label: 'Well', value: wldaWellName(letter) || '—' },
        ],
        confirmLabel: 'Recall',
        severity: 'warning',
        hint: 'This pulls the letter back from the SAP approval workflow. You can submit it again afterwards.',
      })
      .subscribe(confirmed => {
        if (confirmed) this.store.recallLetter();
      });
  }

  protected submit(): void {
    this.store.submitLetter();
  }

  protected save(): void {
    if (this.store.mode() === 'create') this.store.createLetter();
    else this.store.updateLetter();
  }

  /** Downloads the letter exactly as the sheet shows it (an unsaved draft downloads as a draft). */
  protected async download(view: WldaLetterView): Promise<void> {
    if (this.downloading()) return;
    this.downloading.set(true);
    try {
      await downloadWldaPdf(view, `${view.status === 'draft' ? 'WLDA-draft' : view.code}.pdf`);
    } catch {
      this.notify.error('Could not generate the WLDA PDF.');
    } finally {
      this.downloading.set(false);
    }
  }

  /** Each picked file gets its own upload dialog, one after another: a saved letter uploads now, a new one stages the file for Create. */
  protected uploadPicked(files: readonly File[]): void {
    const [file, ...rest] = files;
    if (!file) return;
    const canUpload = this.store.mode() === 'edit';
    this.store.resetUpload();
    this.dialog
      .open<WldaUploadDialogComponent, unknown, boolean>(WldaUploadDialogComponent, {
        data: { store: this.store, file, canUpload },
        panelClass: 'ir-upload-panel',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(accepted => {
        if (accepted && !canUpload) {
          const draft = this.store.draft();
          if (draft) this.store.patchDraft({ files: [...draft.files, file] });
        }
        this.uploadPicked(rest);
      });
  }

  protected confirmDelete(): void {
    const letter = this.store.selectedLetter();
    if (!letter) return;
    this.confirmDialog
      .open({
        title: 'Delete this WLDA letter?',
        rows: [
          { label: 'Letter', value: wldaCode(letter.ltrId) },
          { label: 'Well', value: wldaWellName(letter) || '—' },
        ],
        confirmLabel: 'Delete',
        severity: 'danger',
      })
      .subscribe(confirmed => {
        if (confirmed) this.store.deleteLetter();
      });
  }

  /** Runs `proceed` straight away unless an open draft has unsaved changes, which need a Discard first. */
  private guardUnsaved(proceed: () => void): void {
    if (!this.store.draft() || !this.store.isDirty()) {
      proceed();
      return;
    }
    this.confirmDialog
      .open({
        title: 'Discard unsaved changes?',
        confirmLabel: 'Discard',
        severity: 'warning',
        hint: 'Your changes to this letter have not been saved.',
      })
      .subscribe(confirmed => {
        if (confirmed) proceed();
      });
  }
}
