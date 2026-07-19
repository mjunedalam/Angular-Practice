import { Injectable, inject } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, ValidationErrors, Validators } from "@angular/forms";

function requiredFor(mode: 'FLOW' | 'PUMP'): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const current = ctrl.parent?.get('hydTestTypCd')?.value as string | undefined;
    if (current !== mode) return null;
    const v = ctrl.value;
    const empty = v == null || (typeof v === 'string' && v.length === 0);
    return empty ? { required: true } : null;
  };
}

@Injectable({
    providedIn: "root"
})
export class ActiveWwellFormService {
    private _fb = inject(FormBuilder);

    drillingRemarksForm: FormGroup = this._fb.group({
        epANum: [null, [Validators.required]],
        wActDt: [null, [Validators.required]],
        area: [null, [Validators.required]],
        status: [null, [Validators.required]],
        wOpRmk: [null],
        nxt24HrPlanRmk: [null],
        wDrlgSmryRmk: [null],
        remarks: [null],
    });

    wellTestForm: FormGroup = this._fb.group({
        epANum: [null, [Validators.required]],
        rsvrCd: [null, [Validators.required]],
        hydTestTypCd: ['STP1', [Validators.required]],
        testStaDt: [null, [Validators.required]],
        temp: [null, [Validators.required]],
        hydH2sCnc: [null, [Validators.required]],
        wtrSaTdsCnc: [null, [Validators.required]],
        rpm:        [null, [requiredFor('PUMP')]],
        siwhp:      [null, [requiredFor('FLOW')]],
        hydPmpDpth: [null, [requiredFor('PUMP')]],
        hydProdRt:  [null, [Validators.required]],
        statWlvl:   [null, [requiredFor('PUMP')]],
        dyncWlvl:   [null, [requiredFor('PUMP')]],
        testerNetworkId: [null, [Validators.required]],
        hydProduct: [null],
        duration:   [null, [Validators.required]],
        fwhp:       [null, [requiredFor('FLOW')]],
        remarks:    [null],
    });

}
