import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWwellStore } from '../store/active-wwell.store';

@Component({
  selector: 'app-operation-summary',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './operation-summary.component.html',
  styleUrl: './operation-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationSummaryComponent {
  private readonly store = inject(ActiveWwellStore);

  protected readonly data = this.store.operationSummary;

  formService = inject(ActiveWwellFormService);
  form: any = this.formService.drillingRemarksForm;

  ngOnInit() {

  }
}
