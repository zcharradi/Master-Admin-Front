// operations.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Industry {
  id: number;
  codeIndustry: string;
  labelIndustry: string;
  descriptionIndustry?: string;
  profilIndustry?: number;
}
// operations.service.ts — adapte si besoin
export interface CreateIndustryDto {
  codeIndustry: string;
  labelIndustry: string;
  descriptionIndustry?: string;
  profilIndustry?: number;
  session?: string;        // ← ajoute si le backend l'exige
}

export interface Activity {
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class OperationsService {
  private readonly http       = inject(HttpClient);
  private readonly masterBase = environment.apiBaseUrl;    // https://localhost:8080
  private readonly dmsBase    = environment.dmsApiBaseUrl; // https://localhost:8081

  // Récupère le token JWT stocké
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenStorageKey);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ── Industries → Master API (port 8080) ──────────────────────
  // POST /MasterERPIndustries/GetAll avec DataSourceRequest vide
  getIndustries(): Observable<any> {
    return this.http.post<any>(
      `${this.masterBase}/MasterERPIndustries/GetAll`,
      {},  // DataSourceRequest vide
      { headers: this.getAuthHeaders() }
    );
  }

  addIndustry(dto: CreateIndustryDto): Observable<Industry> {
    return this.http.post<Industry>(
      `${this.masterBase}/MasterERPIndustries/Create`,
      dto,
      { headers: this.getAuthHeaders() }
    );
  }

  // ── Activities → DMS API (port 8081) ─────────────────────────
  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.dmsBase}/api/Activities`);
  }
}