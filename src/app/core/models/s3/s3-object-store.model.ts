/**
 * Response shape for the real S3 object-store proxy's `POST /store` (mocked locally by the sibling
 * s3-client-service project), called directly from the browser — see S3Service. Field names mirror
 * the proxy's own wire contract exactly (snake_case), not this app's usual camelCase.
 */
export interface S3StoreResponse {
  readonly key: string;
  readonly content_type: string;
}
