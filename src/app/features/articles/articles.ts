import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '@swagger-dms/api/article.service';
import { MasterERPIndustriesService } from '@swagger/api/masterERPIndustries.service';
import { MasterERPIndustriesDTO } from '@swagger';
import { ArticleDto } from '@swagger-dms';


@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './articles.html',
  styleUrls: ['./articles.scss'],
})
export class articles implements OnInit {
  private readonly svc = inject(ArticleService);
  private readonly industriesService = inject(MasterERPIndustriesService);

  industries: MasterERPIndustriesDTO[] = [];
  articles: ArticleDto[] = [];

  loadingIndustries = false;
  loadingArticles = false;

  industryError: string | null = null;
  articleError: string | null = null;
  successMessage: string | null = null;

  selectedIndustry: MasterERPIndustriesDTO | null | undefined = undefined;

  // ✅ MODAL INDUSTRIE
  showModal = false;
  saving = false;

  form: any = {
    codeIndustry: '',
    labelIndustry: '',
    descriptionIndustry: '',
  };

  // ✅ MODAL ARTICLE
  showArticleModal = false;
  editingArticleId: number | null = null;

  articleForm: ArticleDto = this.createEmptyArticle();
  showDeleteModal = false;
  articleToDeleteId: number | null = null;
  articleToDeleteLabel: string | null = null;

  private createEmptyArticle(): ArticleDto {
  return {
    codeArticle: 0,
    libelleArticle: '',
    descriptionArticle: '',
    categorieArticle: '',
    industryId: undefined,
    accountPurchases: undefined,
    accountSales: undefined,
    categorieReference: undefined,
    centreCout: undefined,
    compteReclassement: undefined,
    libelleFr: undefined,
    libelleUs: undefined,
    rowSource: undefined,
    salesCategory: undefined,
    typeCompteArticle: undefined,
  };
}


  ngOnInit(): void {
    this.loadIndustries();
  }

  // ✅ LOAD INDUSTRIES
  loadIndustries(): void {
    this.loadingIndustries = true;
    this.industryError = null;

    this.industriesService.masterERPIndustriesReadAllPost().subscribe({
      next: (res) => {
        this.industries = res?.data ?? res ?? [];
        this.loadingIndustries = false;
      },
      error: (err) => {
        console.error(err);
        this.industryError = 'Erreur chargement industries ❌';
        this.loadingIndustries = false;
      }
    });
  }

  // ✅ SELECT INDUSTRY
  selectIndustry(ind: MasterERPIndustriesDTO | null): void {
    this.selectedIndustry = ind;
    

    if (ind === null) {
      this.loadArticles();
    } else {
      this.loadArticles(ind.id);
    }
  }

  // ✅ BACK
  goBack(): void {
    this.selectedIndustry = undefined;
    this.articles = [];
    this.articleError = null;
  }

  // ✅ LOAD ARTICLES
  loadArticles(industryId?: number): void {
    this.loadingArticles = true;
    this.articleError = null;

    const obs = (industryId === null || industryId === undefined)
      ? this.svc.apiArticleGetAllPost()
      : this.svc.apiArticleIndustryIndustryIdGet(industryId);

    obs.subscribe({
      next: (res:any) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        this.articles = list as ArticleDto[];
        console.log('DATA ✅', res);
        this.loadingArticles = false;
      },
      error: (err:any) => {
        console.error(err);
        this.articleError = 'Erreur chargement articles ❌';
        this.loadingArticles = false;
      }
    });
  }

  // ✅ OPEN MODAL ADD ARTICLE
  addArticle(): void {
    this.editingArticleId = null;
    this.articleForm = this.createEmptyArticle();

  
    this.showArticleModal = true;
  }

  editArticle(a: ArticleDto): void {
    this.editingArticleId = a?.codeArticle ?? null;
    this.articleForm = { ...a };
    this.showArticleModal = true;
  }



  // ✅ SAVE ARTICLE (ADD OR UPDATE)
  saveArticle(): void {
   if (!this.articleForm.libelleArticle ) {
    return;
}

    this.saving = true;
    this.articleError = null;
    this.successMessage = null;

    const payload = {
      ...this.articleForm,
      industryId: this.selectedIndustry?.id ?? this.articleForm.industryId
    } as ArticleDto;



    if (this.editingArticleId === null) {
      // Remove codeArticle for create so backend can assign a new code
      delete payload.codeArticle;
      console.log('Adding article:', payload);
      this.svc.apiArticlePost(payload).subscribe({
        next: (res) => {
          console.log('Article added:', res);
          this.successMessage = ' Article ajouté avec succès!';
          this.loadArticles(this.selectedIndustry?.id);
          this.saving = false;
          setTimeout(() => this.closeArticleModal(), 500);
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error('Error adding article:', err);
          this.articleError = err?.error?.message ?? err?.message ?? 'Erreur lors de l\'ajout de l\'article ❌';
          this.saving = false;
        }
      });
    } else {
      // UPDATE
      const code = Number(this.editingArticleId ?? payload.codeArticle);
      if (isNaN(code) || code <= 0) {
        this.articleError = 'Code article invalide pour la mise à jour.';
        this.saving = false;
        return;
      }
      payload.codeArticle = code;

      console.log('Updating article:', payload);
      this.svc.apiArticlePut(payload).subscribe({
        next: (res) => {
          console.log('Article updated:', res);
          this.successMessage = ' Article mis à jour avec succès!';
          this.loadArticles(this.selectedIndustry?.id);
          this.saving = false;
          setTimeout(() => this.closeArticleModal(), 500);
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error('Error updating article:', err);
          this.articleError = err?.error?.message ?? err?.message ?? 'Erreur lors de la mise à jour de l\'article ❌';
          this.saving = false;
        }
      });
    }
  }

  // ✅ CLOSE MODAL ARTICLE
  closeArticleModal(): void {
    this.showArticleModal = false;
    this.editingArticleId = null;
  }

  // ✅ DELETE ARTICLE
  deleteArticle(id: any): void {
    const ok = confirm('Voulez-vous supprimer cet article ?');
    if (!ok) return;

    this.svc.apiArticleCodeArticleDelete(id).subscribe({
      next: () => {
        this.successMessage = ' Article supprimé.';
        this.loadArticles(this.selectedIndustry?.id);
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error(err);
        this.articleError = err?.error?.message ?? err?.message ?? 'Erreur lors de la suppression.';
      }
    });
  }

  // ✅ MODAL INDUSTRY
  openAddModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveIndustry(): void {
    this.saving = true;

    this.industriesService.masterERPIndustriesCreatePost(this.form).subscribe({
      next: () => {
        this.loadIndustries();
        this.saving = false;
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
      }
    });
  }
  confirmDelete(id: number | undefined): void {
  if (id === undefined) return; // ✅ protection
  this.articleToDeleteId = id;
  this.showDeleteModal = true;
}

cancelDelete(): void {
  this.showDeleteModal = false;
  this.articleToDeleteId = null;
}

confirmDeleteAction(): void {
  if (this.articleToDeleteId === null) return;

  this.svc.apiArticleCodeArticleDelete(this.articleToDeleteId).subscribe({
    next: () => {
      this.successMessage = ' Article supprimé avec succès!'
      this.showDeleteModal = false;
      this.articleToDeleteId = null;
      this.loadArticles(this.selectedIndustry?.id);
      setTimeout(() => this.successMessage = null, 3000);
    },
    error: (err) => {
      console.error(err);
      this.articleError = 'Erreur lors de la suppression ❌';
      this.showDeleteModal = false;
    }
  });
}

}
