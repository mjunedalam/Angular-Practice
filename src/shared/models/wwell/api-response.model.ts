import { IWellData } from "../../../models/well-design/well-data.model";

export interface APiResponse<T> {
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
