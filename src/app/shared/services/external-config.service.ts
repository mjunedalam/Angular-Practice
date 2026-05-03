import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AgwaConfig } from '@shared/models/config/agwa-config';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ExternalConfigService {

  private http = inject(HttpClient);
  private config: AgwaConfig | null = null;

  async loadConfig(): Promise<void> {
    const url = `${environment.externalConfigFileUrl}?t=${Date.now()}`;
    this.config = await lastValueFrom(this.http.get<AgwaConfig>(url));
  }

  get settings(): AgwaConfig {
    if (!this.config) {
      throw new Error('AppConfig not loaded');
    }
    return this.config;
  }
}