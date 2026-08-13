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
  readonly description: string;
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
  readonly completion: string;
  readonly openHoleSizeIn: string;
  readonly acidization: string;
  readonly transmission: string;
}

export interface WwellIrRawDevelopmentTesting {
  readonly logging: string;
  readonly mudLogging: string;
  readonly sampling: string;
  readonly flowTest: string;
}

export interface WwellIrRawGeologist {
  readonly geologistPrimary: string;
  readonly geologistSecondary: string;
}

export interface WwellIrRawOffsetWell {
  readonly wellName: string;
}

export interface WwellIrRawRemarks {
  readonly offsetWellsRemarks: string;
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

export interface WwellIrRawFiles {
  readonly locationMap: File[];
  readonly initiationRequest: File[];
}

export interface WwellIrFormRawValue {
  readonly reference: { readonly main: WwellIrRawReference };
  readonly subsurface: {
    readonly formationTops: WwellIrRawFormationTop[];
    readonly casing: WwellIrRawCasingRow[];
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
  readonly attachments: { readonly files: WwellIrRawFiles };
}
