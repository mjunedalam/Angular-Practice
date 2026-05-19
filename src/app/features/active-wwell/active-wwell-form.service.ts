import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Injectable({
    providedIn: "root"
})
export class ActiveWwellFormService {


    drillingRemarksForm: FormGroup = this._fb.group({
        epANum: [null, [Validators.required]],
        wActDt: [null, [Validators.required]],
        area: [null, [Validators.required]],
        status: [null, [Validators.required]],
        wOpRmk: [null, [Validators.required]],
        nxt24HrPlanRmk: [null, [Validators.required]],
        wDrlgSmryRmk: [null, [Validators.required]]
    });


    wellTestForm: FormGroup = this._fb.group({
        epANum: [null, [Validators.required]],
        rsvrCd: [null, [Validators.required]],
        hydTestTypCd: ['STP1', [Validators.required]],
        testStaDt: [null, [Validators.required]],
        temp: [null, [Validators.required]],
        hydH2sCnc: [null, [Validators.required]],
        wtrSaTdsCnc: [null, [Validators.required]],
        rpm: [null, [Validators.required]],
        siwhp: [null, [Validators.required]],
        hydPmpDpth: [null, [Validators.required]],
        hydProdRt: [null, [Validators.required]],
        statWlvl: [null, [Validators.required]],
        dyncWlvl: [null, [Validators.required]],
        testerNetworkId: [null, [Validators.required]],
        hydProduct: [null, [Validators.required]],
        duration: [null, [Validators.required]],
    });;

    constructor(private _fb: FormBuilder, private http: HttpClient) {

    }
}
