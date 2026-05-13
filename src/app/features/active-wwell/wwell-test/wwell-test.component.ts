import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { AuthStore } from '../../auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

@Component({
  selector: 'app-wwell-test',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './wwell-test.component.html',
  styleUrl: './wwell-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellTestComponent {
  private readonly store    = inject(ActiveWwellStore);
  private readonly auth     = inject(AuthStore);
  private readonly rbac     = inject(RbacStore);

  protected readonly data = this.store.wwellTest;

  protected readonly isFlowTest = computed(() => {
    const data = this.data();
    if (!data) return false;
    return data.flowType === 'Y' || data.testType.toLowerCase() === 'flow';
  });

  protected readonly canUpdate = computed(() =>
    this.rbac.canUpdateRoute('active-wwell', this.auth.user()?.groups ?? []),
  );
}
