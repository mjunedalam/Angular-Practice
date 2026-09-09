import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { IrAttachment, IrAttachmentSlot } from '@models/wwell-planning/ir-attachment.model';
import { WWELL_IR_ATTACHMENT_SLOTS, irAttachmentFor } from '../../wwell-ir-attachments.config';
import {
  KvRow,
  buildGeologistContactRows,
  buildHydrogeologyRows,
  buildProgramDevRows,
  buildProgramMainRows,
  buildRequestReferenceRows,
} from '../../wwell-ir-editor/wwell-ir-detail-rows.util';
import { WwellIrStore } from '../../store/wwell-ir.store';
import { WWELL_IR_SUBMITTABLE_STATUSES } from '../../wwell-ir.config';
import { WwellIrViewKvCardComponent } from '../wwell-ir-view-kv-card/wwell-ir-view-kv-card.component';

/** "Details" step of the read-only IR view: General Information, Program Details, Geologist
 *  Contact, Attachments, Area Water Wells, Estimated Hydrology, and — mirroring the reference
 *  GWD/AGWA "Integrated Requirements" screen — an Approval action at the bottom. Every KV card
 *  besides Attachments/Area Water Wells reuses the exact same `KvRow` builders
 *  WwellIrEditorComponent's own read display already uses, so this page never drifts out of sync
 *  with what the inline editor shows for the same record. */
@Component({
  selector: 'app-wwell-ir-view-details',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, WwellIrViewKvCardComponent],
  templateUrl: './wwell-ir-view-details.component.html',
  styleUrl: './wwell-ir-view-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrViewDetailsComponent {
  readonly ir = input.required<IntegratedRequirement>();

  protected readonly attachmentSlots = WWELL_IR_ATTACHMENT_SLOTS;

  protected attachmentFor(slot: IrAttachmentSlot): IrAttachment | null {
    return irAttachmentFor(this.ir().attachments, slot);
  }
  /** Resolves `requestReference.linkedRequestId` to a well name — see
   *  buildRequestReferenceRows' own doc comment. Falls back to the raw id when omitted. */
  readonly linkedRequestWellOptions = input<readonly { readonly value: string; readonly label: string }[]>([]);

  private readonly store = inject(WwellIrStore);
  protected readonly isSubmitting = this.store.updatingIrStatus;

  // Record-level fields (`code`/`updatedDate`) layered onto the request-reference fields —
  // matches the reference screen's "General Information" card, which shows both together.
  protected readonly generalInfoRows = computed<readonly KvRow[]>(() => [
    { label: 'IR #', value: this.ir().code },
    ...buildRequestReferenceRows(this.ir(), this.linkedRequestWellOptions()),
    { label: 'Last Updated', value: this.ir().updatedDate },
  ]);
  protected readonly programDetailsRows = computed(() => [...buildProgramMainRows(this.ir()), ...buildProgramDevRows(this.ir())]);
  protected readonly geologistContactRows = computed(() => buildGeologistContactRows(this.ir()));
  protected readonly hydrogeologyRows = computed(() => buildHydrogeologyRows(this.ir()));

  // "Request Approval" only makes sense before the record has already left the author's hands —
  // same gate WwellIrEditorComponent's own "Submit for Review" button uses.
  protected readonly canRequestApproval = computed(() => WWELL_IR_SUBMITTABLE_STATUSES.includes(this.ir().status));

  protected requestApproval(): void {
    this.store.submitIrForReview(this.ir());
  }
}
