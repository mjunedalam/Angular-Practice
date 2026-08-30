import { IWellData } from 'src/app/core/models/well-design/well-data.model';

/** Collection metadata a list endpoint may attach — currently just the result count
 *  (`totalSize`, matching the backend's `ApiResponse.Meta` record). Optional: only endpoints that
 *  actually populate it (the agwa-planning IR list endpoints, as of this field's introduction)
 *  will have it — every other `ApiResponse<T>` consumer sees `undefined`, same as before. */
export interface ApiResponseMeta {
    totalSize: number;
}

export interface ApiResponse<T> {
    statusCode: number;
    error: boolean;
    message: string;
    data: T[];
    meta?: ApiResponseMeta;
}

export interface WellDetailsResponse {
    readonly  statusCode: number;
    readonly error: boolean;
    readonly  message: string;
    readonly data: IWellData[]
}

export interface UploadDocResponse {
    statusCode: number;
    error: boolean;
    message: string;
    data: string;
}

export interface DocListData {
    totalFiles: string[];
}

export interface DocListResponse {
    statusCode: number;
    error: boolean;
    message: string | null;
    data: DocListData;
}

export interface DocRemoveResponse {
    statusCode: number;
    error: boolean;
    message: string;
    data: string;
}   
