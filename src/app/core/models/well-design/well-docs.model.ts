export type DocType = 'PDF' | 'IMAGE' | 'EXCEL' | 'WORD' | 'OTHER';

export interface WellDoc {
  readonly id: string;
  readonly title: string;
  readonly docType: DocType;
  readonly category: string;
  readonly uploadedBy: string;
  readonly uploadedAt: string;
  readonly fileSize: number;
  readonly url: string;
  readonly tags: readonly string[];
  readonly wellName: string;
  readonly date: string;
  readonly description?: string;
  readonly pageCount?: number;
}

export interface WellDocsState {
  readonly docs: WellDoc[];
  readonly selectedDoc: WellDoc | null;
  readonly loading: boolean;
  readonly uploading: boolean;
  readonly error: string | null;
  readonly viewerOpen: boolean;
  readonly docNames: string[];
  readonly listLoading: boolean;
  readonly listError: string | null;
}
