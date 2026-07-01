import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface TranslationRow {
  sourceLabel: string;
  idFr: number;
  translatedLabelFr: string | null;
  idDe: number;
  translatedLabelDe: string | null;
  editing?: boolean;
  editFr?: string | null;
  editDe?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly dmsBase = environment.dmsApiBaseUrl;

  getTranslations(menu: string): Observable<any> {
    const params = new HttpParams()
      .set('page', '1')
      .set('pageSize', '9999');  // tout charger d'un coup

    return this.http.post<any>(
      `${this.dmsBase}/api/Translation/${menu}`,
      params.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) }
    );
  }

  updateFr(id: number, value: string): Observable<void> {
    return this.http.put<void>(
      `${this.dmsBase}/api/Translation/fr/${id}`,
      JSON.stringify(value),
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  updateDe(id: number, value: string): Observable<void> {
    return this.http.put<void>(
      `${this.dmsBase}/api/Translation/de/${id}`,
      JSON.stringify(value),
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }
}