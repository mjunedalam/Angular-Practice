import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WldaLetter, WldaLetterView } from '@models/wwell-planning/wlda.model';
import { NotificationService } from '@shared/components/notification/notification.service';
import { ActionConfirmDialogService } from '@shared/components/action-confirm-dialog/action-confirm-dialog.service';
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
  imports: [FormsModule, MatButtonModule, MatIconModule, WldaFormComponent, WldaSheetComponent],
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
    if (letter) return viewOfLetter(letter, this.store.storedAttachments(), draft);
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
      if (first) untracked(() => this.store.select(wldaKey(first)));
    });
  }

  protected readonly canSave = computed(() => this.store.draftErrors().length === 0 && !this.store.saving());

  protected code(letter: WldaLetter): string {
    return wldaCode(letter.ltrId);
  }

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
      this.store.select(wldaKey(letter));
    });
  }

  protected newDraft(): void {
    this.guardUnsaved(() => {
      this.deselected.set(false);
      this.store.startDraft();
    });
  }

  /** Back / View: leaves the draft (create → nothing open, edit → the saved letter), confirming first if it changed. */
  protected leaveDraft(): void {
    this.guardUnsaved(() => this.store.discardDraft());
  }

  protected back(): void {
    this.guardUnsaved(() => {
      this.deselected.set(true);
      this.store.select(null);
    });
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
