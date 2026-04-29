import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export type QueryParams = Record<string, string | number | boolean>;

const TIMEOUT_MS = 5000;

@Injectable({ providedIn: 'root' })
export class ApiHttpService {
    private readonly http = inject(HttpClient);

    get<T>(url: string, params?: QueryParams): Observable<T> {
        return this.http
            .get<T>(url, { params: toHttpParams(params) })
            .pipe(timeout(TIMEOUT_MS));
    }

    post<T>(url: string, body: unknown, params?: QueryParams): Observable<T> {
        return this.http
            .post<T>(url, body, { params: toHttpParams(params) })
            .pipe(timeout(TIMEOUT_MS));
    }

    put<T>(url: string, body: unknown, params?: QueryParams): Observable<T> {
        return this.http
            .put<T>(url, body, { params: toHttpParams(params) })
            .pipe(timeout(TIMEOUT_MS));
    }

    delete<T>(url: string, params?: QueryParams): Observable<T> {
        return this.http
            .delete<T>(url, { params: toHttpParams(params) })
            .pipe(timeout(TIMEOUT_MS));
    }

    upload<T>(url: string, formData: FormData, params?: QueryParams): Observable<T> {
        return this.http
            .post<T>(url, formData, { params: toHttpParams(params) })
            .pipe(timeout(TIMEOUT_MS));
    }

    blob(url: string, params?: QueryParams): Observable<Blob> {
        return this.http
            .get(url, { params: toHttpParams(params), responseType: 'blob' })
            .pipe(timeout(TIMEOUT_MS));
    }
}

function toHttpParams(params?: QueryParams): HttpParams {
    if (!params) return new HttpParams();
    return Object.entries(params).reduce(
        (acc, [key, value]) => acc.set(key, String(value)),
        new HttpParams(),
    );
}
