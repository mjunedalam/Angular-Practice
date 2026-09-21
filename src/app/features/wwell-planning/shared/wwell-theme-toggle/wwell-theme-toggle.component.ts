import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAX_CONTRAST, MIN_CONTRAST, WwellThemeMode, WwellThemeService } from '../wwell-theme.service';

interface ModeOption {
  readonly value: WwellThemeMode;
  readonly label: string;
  readonly icon: string;
}

const MODE_OPTIONS: readonly ModeOption[] = [
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'system', label: 'System', icon: 'brightness_auto' },
];

/** Below the control, right-aligned to it; flips above when there is no room underneath. */
const POPOVER_POSITIONS: ConnectedPosition[] = [
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
];

/**
 * Appearance control for the shell's top bar: a one-press light/dark switch, plus an Appearance popover
 * for the System/Light/Dark choice, a contrast dial for whichever theme is showing, and the Legacy
 * layout switch that swaps the redesigned top bar and left nav for the old navy ones.
 */
@Component({
  selector: 'app-wwell-theme-toggle',
  standalone: true,
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, CdkTrapFocus, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './wwell-theme-toggle.component.html',
  styleUrl: './wwell-theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellThemeToggleComponent {
  protected readonly theme = inject(WwellThemeService);
  protected readonly modeOptions = MODE_OPTIONS;
  protected readonly popoverPositions = POPOVER_POSITIONS;
  protected readonly minContrast = MIN_CONTRAST;
  protected readonly maxContrast = MAX_CONTRAST;
  protected readonly isOpen = signal(false);

  private readonly tuneTrigger = viewChild.required('tuneTrigger', { read: ElementRef<HTMLElement> });

  protected toggleOpen(): void {
    this.isOpen.update((open) => !open);
  }

  /** Closes the popover and puts focus back on its trigger — Safari doesn't focus a button on click,
   *  so the focus trap's own restore would land on <body>. */
  protected close(): void {
    this.isOpen.set(false);
    this.tuneTrigger().nativeElement.focus();
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    this.close();
  }

  protected onContrastInput(event: Event): void {
    this.theme.setContrast((event.target as HTMLInputElement).valueAsNumber);
  }
}
