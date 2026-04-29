import { IWellData } from 'src/app/core/models/well-design/well-data.model';

export interface ApiResponse<T> {
    statusCode: number;
    error: boolean;
    message: string;
    data: T[];
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
