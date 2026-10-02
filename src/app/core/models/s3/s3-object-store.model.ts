/**
 * Response shape for the real S3 object-store proxy's `POST /store` (mocked locally by the sibling
 * s3-client-service project), called directly from the browser — see S3Service. Field names mirror
 * the proxy's own wire contract exactly (snake_case), not this app's usual camelCase.
 */
export interface S3StoreResponse {
  readonly key: string;
  readonly content_type: string;
}

/** Response shape for `POST /delete`. `object_deleted`/`index_deleted` are reported separately by
 *  the real proxy (the underlying bytes and its own search index are two different operations) —
 *  the caller (WwellIrStore.deleteIrAttachment) treats the call as successful as a whole and
 *  doesn't distinguish between the two. */
export interface S3DeleteResponse {
  readonly object_key: string;
  readonly object_deleted: boolean;
  readonly index_deleted: boolean;
}

/** One step of an in-flight `POST /store` — mirrors IrAttachmentUploadEvent's shape (percent +
 *  null-until-done payload) so the editor's progress-bar logic reads the same either way. */
export interface S3StoreUploadEvent {
  readonly percent: number;
  readonly response: S3StoreResponse | null;
}

/** One row of `GET /search`'s `objects` array — upper-snake field names matching the real proxy's
 *  wire contract exactly (a raw projection of the underlying Oracle column names), not this app's
 *  usual camelCase. */
export interface S3SearchResult {
  readonly OBJ_KEY: string;
  readonly BUCKET_NAME: string;
  readonly OBJ_SIZE: number;
  readonly CONTENT_TYPE_CD: string;
  readonly ORIGINAL_FILENAME: string;
  readonly CUSTOM_METADATA: unknown;
}

/** Response shape for `GET /search?q=...`. */
export interface S3SearchResponse {
  readonly query: string;
  readonly count: number;
  readonly objects: readonly S3SearchResult[];
}
