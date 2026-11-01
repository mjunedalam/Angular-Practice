/** Mirrors WWELL_IR_FORM_SCHEMA's nested FormGroup shape 1:1 — hand-written since the schema is runtime data. */

export interface WwellIrRawReference {
  readonly linkedRequestId: string;
  readonly letterNumber: string;
  readonly client: string;
  readonly supportingBusiness: string;
  readonly wellName: string;
  readonly targetAquifer: string;
  readonly targetDepthFt: number | null;
  readonly surfaceElevationFtAsl: number | null;
  readonly coordinates: string;
}

export interface WwellIrRawFormationTop {
  readonly name: string;
  readonly depthFt: number | null;
  readonly subSeaFtAsl: number | null;
}

export interface WwellIrRawCasingRow {
  readonly type: string;
  readonly sizeIn: string;
  readonly depthFtBgl: number | null;
  /** Only meaningful when `type === 'Liner'` — see the `visibleWhen` gate on this field in wwell-ir-form.schema.ts. */
  readonly tolFtBgl: number | null;
  readonly remarks: string;
}

export interface WwellIrRawProgramMain {
  /** The single-pick Completion dropdown (see wwell-ir-completion-type.config.ts). */
  readonly completionType: string;
  /** "Completion Remarks" — the older free-text/multi-select field, still exad_gwd_ir_header.completion. */
  readonly completion: string;
  readonly openHoleSizeIn: string;
  /** Only asked for when `completionType` is a Liner pick. */
  readonly linerSizeIn: string;
  readonly acidization: string;
  readonly transmission: string;
}

export interface WwellIrRawDevelopmentTesting {
  readonly logging: string;
  readonly mudLogging: string;
  readonly sampling: string;
  readonly flowTest: string;
  readonly remarks: string;
}

/** Flat shape of the IR editor's merged "Program Details" FormGroup — Program Details
 *  (completion/acidization/transmission) and Development & Testing (logging/mudLogging/sampling/
 *  flowTest/remarks) are one combined, one-pencil-edit section there (see
 *  wwell-ir-editor.component.ts's `programEdit`) even though they still split back into `main`/
 *  `developmentTesting` on the way to `WwellIrFormRawValue`. */
export type WwellIrRawProgramDetails = WwellIrRawProgramMain & WwellIrRawDevelopmentTesting;

export interface WwellIrRawGeologist {
  readonly geologistPrimary: string;
  readonly geologistSecondary: string;
}

export interface WwellIrRawOffsetWell {
  readonly epANum: number | null;
  readonly distanceKm: number | null;
  readonly location: string;
  readonly aquifer: string;
  readonly totalDepthFt: number | null;
  readonly testDurationMin: number | null;
  readonly rateGpm: number | null;
  readonly rpm: number | null;
  readonly swlFt: number | null;
  readonly pwlFt: number | null;
  /** No form control (removed from the Area Water Wells UI) — carried over from the stored row on
   *  save so existing database values are never wiped (see buildWaterRows). */
  readonly drawdownFt?: number | null;
  readonly specificCapacity?: number | null;
  readonly tdsPpm: number | null;
  readonly h2sPpm: number | null;
}

export interface WwellIrRawRemarks {
  readonly offsetWellsRemarks: string;
}

/** Single Formation Tops remarks field (maps to `topsRemarks`/exad_gwd_ir_header.tops_remarks) —
 *  applies to the whole Horizons section, not any one row. Mirrors `WwellIrRawRemarks` above. */
export interface WwellIrRawTopsRemarks {
  readonly topsRemarks: string;
}

export interface WwellIrRawHydrology {
  readonly testType: string;
  readonly aquifer: string;
  readonly siwhpPsi: number | null;
  readonly estimatedTdsPpm: number | null;
  readonly estimatedRateGpm: number | null;
  readonly h2sPpm: number | null;
  readonly estimatedWaterLevelFt: number | null;
  readonly estimatedPumpDepthFt: number | null;
}

export interface WwellIrRawFileField {
  readonly file: File[];
}

export interface WwellIrFormRawValue {
  readonly reference: { readonly main: WwellIrRawReference };
  readonly subsurface: {
    readonly formationTops: WwellIrRawFormationTop[];
    readonly casing: WwellIrRawCasingRow[];
    readonly remarks: WwellIrRawTopsRemarks;
  };
  readonly programDetails: {
    readonly main: WwellIrRawProgramMain;
    readonly developmentTesting: WwellIrRawDevelopmentTesting;
  };
  readonly contacts: {
    readonly geologist: WwellIrRawGeologist;
    readonly offsetWells: WwellIrRawOffsetWell[];
    readonly remarks: WwellIrRawRemarks;
  };
  readonly hydrogeology: { readonly main: WwellIrRawHydrology };
  readonly attachments: {
    readonly locationMap: WwellIrRawFileField;
    readonly initiationRequest: WwellIrRawFileField;
    readonly wlda: WwellIrRawFileField;
  };
}
