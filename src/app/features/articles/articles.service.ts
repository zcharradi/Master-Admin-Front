import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Industry {
  id: number;
  codeIndustry: string;
  labelIndustry: string;
  descriptionIndustry?: string;
}

export interface Article {
  codeArticle: number;
  libelleArticle: string;
  descriptionArticle?: string;
  categorieArticle?: string;
  industryId?: number;
   addNewTime?: string;   
  editTime?: string;   
}

export interface CreateIndustryDto {
  codeIndustry: string;
  labelIndustry: string;
  descriptionIndustry?: string;
}

export interface ProductServiceCategory {
  id: number;
  label: string;
  industryId: number;
  isDefault: boolean;
}

// dans la classe articlesService, ajouter cette méthode :



@Injectable({ providedIn: 'root' })
export class articlesService {
  private readonly http = inject(HttpClient);
  private readonly masterBase = environment.apiBaseUrl;
  private readonly dmsBase = environment.dmsApiBaseUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenStorageKey);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // ===== INDUSTRY =====

  getIndustries(): Observable<any> {
    return this.http.post<any>(
      `${this.masterBase}/MasterERPIndustries/GetAll`,
      {},
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

  // ===== ARTICLES =====

  getArticles(industryId?: number): Observable<Article[]> {
    if (industryId) {
      return this.http.get<Article[]>(
        `${this.dmsBase}/api/Article/industry/${industryId}`
      );
    }
    return this.http.get<Article[]>(`${this.dmsBase}/api/Article`);
  }

  addArticle(article: Article): Observable<Article> {
    return this.http.post<Article>(`${this.dmsBase}/api/Article`, article);
  }

  updateArticle(article: Article): Observable<void> {
    return this.http.put<void>(`${this.dmsBase}/api/Article`, article);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.dmsBase}/api/Article/${id}`
    );
  }


// dans la classe articlesService, ajouter cette méthode :
getCategories(industryId: number): Observable<ProductServiceCategory[]> {
  return this.http.get<ProductServiceCategory[]>(
    `${this.dmsBase}/api/Article/categories/by-industry/${industryId}`
  );
}
getAllCategories(): Observable<ProductServiceCategory[]> {
  return this.http.get<ProductServiceCategory[]>(
    `${this.dmsBase}/api/Article/categories/all`
  );
}

}