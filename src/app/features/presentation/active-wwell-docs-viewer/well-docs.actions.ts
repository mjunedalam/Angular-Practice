import { WellDoc } from '@models/well-design/well-docs.model';

export const WellDocsActions = {
  loadDocs:    '[Well Docs] Load Docs',
  openViewer:  '[Well Docs] Open Viewer',
  closeViewer: '[Well Docs] Close Viewer',
  clearDocs:   '[Well Docs] Clear Docs',
} as const;

export const WellDocsEvents = {
  docsLoaded:     '[Well Docs] Docs Loaded',
  docsLoadFailed: '[Well Docs] Docs Load Failed',
} as const;

export interface LoadDocsPayload {
  epANum: number;
  date: string;
}

export interface DocsLoadedPayload {
  docs: WellDoc[];
}

export interface DocsErrorPayload {
  error: string;
}
