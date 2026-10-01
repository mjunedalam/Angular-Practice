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
 *  the caller (WwellIrStore.deleteFromS3) treats the call as successful as a whole and doesn't
 *  distinguish between the two. */
export interface S3DeleteResponse {
  readonly object_key: string;
  readonly object_deleted: boolean;
  readonly index_deleted: boolean;
}
