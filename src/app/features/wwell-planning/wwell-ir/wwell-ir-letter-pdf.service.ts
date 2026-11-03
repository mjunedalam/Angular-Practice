import { ApplicationRef, EnvironmentInjector, Injectable, createComponent, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { IrAttachment } from '@models/wwell-planning/ir-attachment.model';
import { S3Service } from '@services/s3/s3.service';
import { WWELL_IR_ATTACHMENT_SLOTS, irAttachmentsFor } from './wwell-ir-attachments.config';
import { appendAttachmentsToLetter, IrLetterAttachmentFile } from './wwell-ir-letter-attachments.util';
import { hasWellboreDiagramDataForIntegratedRequirement } from './wwell-ir-form/wwell-ir-wellbore-diagram.mapper';
import { resolveLetterStampStatus, resolveLetterWorkflow } from './wwell-ir.config';
import { WwellIrService } from './wwell-ir.service';
import { WwellIrViewLetterComponent } from './wwell-ir-view/wwell-ir-view-letter/wwell-ir-view-letter.component';

/** The wellbore diagram's D3 entrance animation (see ANIM in wellbore-diagram.model.ts — staggered
 *  casing/open-hole/gravel reveals) must finish before the SVG is rasterized, or the snapshot
 *  catches a half-drawn well. Rather than a fixed sleep, the capture waits until the off-screen
 *  copy has stopped changing (`DIAGRAM_QUIET_MS` without a DOM mutation), bounded below and above
 *  so a diagram that never mutates still captures and one that never stops still does. */
const DIAGRAM_MIN_WAIT_MS = 500;
const DIAGRAM_QUIET_MS = 600;
const DIAGRAM_MAX_WAIT_MS = 4000;
const OFFSCREEN_LETTER_WIDTH_PX = 900;
const DIAGRAM_CAPTURE_ATTEMPTS = 3;

/** Resolves once `host` has gone `DIAGRAM_QUIET_MS` without a DOM mutation (never sooner than
 *  `DIAGRAM_MIN_WAIT_MS`, never later than `DIAGRAM_MAX_WAIT_MS`). D3 transitions write attributes
 *  every frame, so silence means the entrance animation is finished. */
export function waitForDiagramToSettle(host: HTMLElement): Promise<void> {
  return new Promise(resolve => {
    let quietTimer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(() => armQuietTimer());
    const finish = () => {
      observer.disconnect();
      clearTimeout(quietTimer);
      clearTimeout(maxTimer);
      resolve();
    };
    function armQuietTimer(): void {
      clearTimeout(quietTimer);
      quietTimer = setTimeout(finish, DIAGRAM_QUIET_MS);
    }
    const maxTimer = setTimeout(finish, DIAGRAM_MAX_WAIT_MS);
    observer.observe(host, { subtree: true, childList: true, attributes: true, characterData: true });
    quietTimer = setTimeout(finish, Math.max(DIAGRAM_MIN_WAIT_MS, DIAGRAM_QUIET_MS));
  });
}

/** Reads a `Blob` via `FileReader` rather than `Blob.arrayBuffer()` — the latter isn't implemented
 *  by jsdom (this repo's test environment), while `FileReader.readAsArrayBuffer` is. */
export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Builds the complete IR letter PDF — the same document the view's "Download PDF" produces: the
 * backend-rendered letter (with the wellbore diagram, stamp and workflow section) followed by every
 * stored attachment appended as trailing pages. Shared by the download and by Submit for Review, so
 * what SAP receives is always byte-for-byte what a user would download for the same record.
 */
@Injectable({ providedIn: 'root' })
export class WwellIrLetterPdfService {
  private readonly irService = inject(WwellIrService);
  private readonly s3 = inject(S3Service);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  /** Renders the letter, with the diagram captured from an off-screen copy of the Letter tab —
   *  needed when no Letter tab is on screen (e.g. submitting from the editor). Never yields a
   *  letter missing its diagram: if the record has diagram data and the capture keeps failing, this
   *  rejects instead. Also rejects if the backend refuses to render the letter (the caller owns the
   *  error message). */
  async buildLetterPdf(ir: IntegratedRequirement): Promise<Blob> {
    if (ir.irSeq == null) throw new Error('Save the integrated requirement before generating its letter.');
    const wellboreImageBase64 = await this.captureRequiredWellboreImage(ir);
    const letter = await firstValueFrom(
      this.irService.downloadLetterPdf(ir.irSeq, wellboreImageBase64, resolveLetterStampStatus(ir), resolveLetterWorkflow(ir) ?? undefined),
    );
    return this.mergeAttachments(letter, ir);
  }

  /** Merges the IR's stored attachments onto the rendered letter entirely client-side. Each
   *  attachment is fetched independently so one unreadable file is dropped without losing the
   *  others, and any failure of the merge itself falls back to the unmerged letter — a broken
   *  appendix should never turn a working letter into a failed one. */
  async mergeAttachments(letterBlob: Blob, ir: IntegratedRequirement): Promise<Blob> {
    if (ir.attachments.length === 0) return letterBlob;

    try {
      const ordered: IrAttachment[] = WWELL_IR_ATTACHMENT_SLOTS.flatMap(config => irAttachmentsFor(ir.attachments, config.slot));
      const fetched = await Promise.all(ordered.map(attachment => this.fetchAttachmentFile(attachment)));
      const files = fetched.filter((file): file is IrLetterAttachmentFile => file !== null);
      const merged = await appendAttachmentsToLetter(await blobToArrayBuffer(letterBlob), files);
      return new Blob([new Uint8Array(merged)], { type: 'application/pdf' });
    } catch {
      return letterBlob;
    }
  }

  private async fetchAttachmentFile(attachment: IrAttachment): Promise<IrLetterAttachmentFile | null> {
    try {
      const file = await firstValueFrom(this.s3.download(attachment.objectKey, attachment.fileName));
      return { label: attachment.label, contentType: attachment.contentType, bytes: await blobToArrayBuffer(file) };
    } catch {
      return null;
    }
  }

  private async captureRequiredWellboreImage(ir: IntegratedRequirement): Promise<string | undefined> {
    if (!hasWellboreDiagramDataForIntegratedRequirement(ir)) return undefined;
    for (let attempt = 0; attempt < DIAGRAM_CAPTURE_ATTEMPTS; attempt++) {
      const image = await this.captureWellboreImageOffscreen(ir);
      if (image) return image;
    }
    throw new Error('Could not render the wellbore diagram for the IR letter. Please try submitting again.');
  }

  /** Mounts the real Letter component off-screen (laid out, so the diagram gets real dimensions),
   *  waits out the diagram animation, captures it, then tears everything down. Yields `undefined`
   *  when the capture fails; the caller decides whether that is acceptable. */
  private async captureWellboreImageOffscreen(ir: IntegratedRequirement): Promise<string | undefined> {
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = `position:fixed;top:0;left:-10000px;width:${OFFSCREEN_LETTER_WIDTH_PX}px;pointer-events:none;`;
    document.body.appendChild(host);
    const componentRef = createComponent(WwellIrViewLetterComponent, { environmentInjector: this.environmentInjector, hostElement: host });
    try {
      componentRef.setInput('ir', ir);
      this.appRef.attachView(componentRef.hostView);
      componentRef.changeDetectorRef.detectChanges();
      await waitForDiagramToSettle(host);
      return await componentRef.instance.captureWellboreImage();
    } catch {
      return undefined;
    } finally {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      host.remove();
    }
  }
}
