export type WldaStatus = 'draft' | 'submitted' | 'approved';

export type WldaWellType = 'Production' | 'Observation' | 'Monitoring' | 'Injection';

export interface WldaRecord {
  readonly id: string;
  /** Letter reference, e.g. `WLDA-26-001`. */
  readonly code: string;
  readonly status: WldaStatus;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly waterWellName: string;
  readonly field: string;
  readonly wellNumber: string;
  readonly reservoir: string;
  readonly wellType: WldaWellType | '';
  readonly totalDepth: string;
  readonly cathodicProtection: boolean;
  readonly north: string;
  readonly east: string;
  readonly zone: string;
  readonly remarks: string;
  readonly distribution: string;
  readonly attachments: readonly string[];
}

/** Fields the author types into — everything but the identity/audit columns. */
export type WldaFormValue = Omit<WldaRecord, 'id' | 'code' | 'status' | 'createdAt' | 'createdBy'>;
