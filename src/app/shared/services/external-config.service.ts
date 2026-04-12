import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AgwaConfig } from '../models/config/agwa-config';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExternalConfigService {

  private http = inject(HttpClient);
  private config: AgwaConfig | null = null;

  async loadConfig(): Promise<void> {
    const url = `${environment.externalConfigFileUrl}?t=${Date.now()}`;
    try {
      this.config = await lastValueFrom(this.http.get<AgwaConfig>(url));
    } catch (err) {
      console.error('Critical Error: Could not load App Config', err);
      throw err;
    }
  }

  get settings(): AgwaConfig {
    if (!this.config) {
      throw new Error('AppConfig not loaded');
    }
    return this.config;
  }
}