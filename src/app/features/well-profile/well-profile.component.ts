import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WwellThemeService } from '../wwell-planning/shared/wwell-theme.service';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, CellKeyDownEvent, ColDef, FullWidthCellKeyDownEvent, GridReadyEvent, themeQuartz } from 'ag-grid-community';
import { WellProfileStore } from './well-profile.store';
import { ProfileString } from './well-profile.data';
import { WellProfileDiagramComponent } from './well-profile-diagram.component';
import { WellProfileIntervalsComponent } from './well-profile-intervals.component';

@Component({
  selector: 'app-well-profile', standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatButtonToggleModule, MatIconModule, MatSliderModule, MatFormFieldModule, MatSelectModule, MatProgressBarModule, MatTooltipModule,
    AgGridAngular, WellProfileDiagramComponent, WellProfileIntervalsComponent],
  providers: [WellProfileStore], templateUrl: './well-profile.component.html',
  styleUrl: './well-profile.component.scss', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WellProfileComponent {
  readonly store = inject(WellProfileStore);
  private readonly destroyRef = inject(DestroyRef);
  private frame = 0;
  private readonly grid = viewChild(AgGridAngular<ProfileString>);
  readonly rowSelection = { mode: 'singleRow' as const, checkboxes: false, enableClickSelection: false };
  readonly theme = inject(WwellThemeService);
  readonly modules = [AllCommunityModule];
  readonly modes = [{ value: 'solid', label: '3D' }, { value: 'transparent', label: 'Transparent' },
    { value: 'xray', label: 'X-ray' }, { value: 'profile', label: 'Profile' }];
  readonly columns: ColDef<ProfileString>[] = [
    { headerName: 'String / OD', flex: 1, minWidth: 110, valueGetter: p => `${p.data?.csgSize}″ ${p.data?.csgType}` },
    { field: 'top', headerName: 'Top', width: 60 },
    { field: 'csgDepth', headerName: 'Shoe', width: 64 },
  ];
  readonly gridTheme = computed(() => themeQuartz.withParams({
    backgroundColor: 'var(--wp-surface)', foregroundColor: 'var(--wp-text)',
    headerBackgroundColor: 'var(--wp-surface-alt)',
    borderColor: 'var(--wp-line)', fontSize: 11, spacing: 4,
    selectedRowBackgroundColor: 'var(--wp-accent-soft)',
  }));
  readonly selectedLabel = computed(() => `${this.store.selected()?.csgSize}″ ${this.store.selected()?.csgType}`);
  readonly viewTitle = computed(() => this.store.exploded() && this.store.mode() !== 'profile' ? 'Exploded assembly · depth aligned' :
    ({ solid: '3D · translucent casing assembly', transparent: 'Nested casing assembly', xray: 'X-ray · all string extents', profile: 'Construction interval analysis' })[this.store.mode()]);

  constructor() {
    this.store.loadIrs();
    this.destroyRef.onDestroy(() => cancelAnimationFrame(this.frame));
    effect(() => {
      const id = this.store.selectedId();
      const api = this.grid()?.api;
      if (api && !api.isDestroyed()) api.forEachNode(node => node.setSelected(node.data?.id === id));
    });
  }

  selectIr(irSeq: number): void {
    cancelAnimationFrame(this.frame);
    this.store.loadIr(irSeq);
  }

  onGridReady(event: GridReadyEvent<ProfileString>): void {
    event.api.forEachNode(node => node.setSelected(node.data?.id === this.store.selectedId()));
  }

  onCellKeyDown(event: CellKeyDownEvent<ProfileString> | FullWidthCellKeyDownEvent<ProfileString>): void {
    const key = (event.event as KeyboardEvent | undefined)?.key;
    if (key === 'Enter' || key === ' ') {
      event.event?.preventDefault();
      this.store.select(event.data?.id ?? '');
    }
  }

  explode(): void {
    cancelAnimationFrame(this.frame);
    this.store.toggleExploded();
    const start = this.store.spread(), target = this.store.exploded() ? 1 : 0;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { this.store.setSpread(target); return; }
    const begin = performance.now();
    const animate = (now: number): void => {
      const t = Math.min(1, (now - begin) / 1050);
      const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
      this.store.setSpread(start + (target-start)*ease);
      if (t < 1) this.frame = requestAnimationFrame(animate);
    };
    this.frame = requestAnimationFrame(animate);
  }
}
