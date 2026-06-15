import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { articlesService, Industry, CreateIndustryDto, Activity } from './articles.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './articles.html',
  styleUrls: ['./articles.scss'],
})
export class articles implements OnInit {
  private readonly svc = inject(articlesService);

  // ── Industries ────────────────────────────────────
  industries: Industry[] = [];
  loadingIndustries = false;
  industryError: string | null = null;

  // ── Navigation ────────────────────────────────────
  // undefined = grid view | null = all industries | Industry = specific
  selectedIndustry: Industry | null | undefined = undefined;

  // ── Activities ────────────────────────────────────
  activities: Activity[] = [];
  columns: string[] = [];
  loadingActivities = false;
  activityError: string | null = null;

  // ── Modal ─────────────────────────────────────────
  showModal = false;
  saving = false;
  form: CreateIndustryDto = { codeIndustry: '', labelIndustry: '', descriptionIndustry: '' };

  ngOnInit(): void {
    this.loadIndustries();
  }

  // ── Load industries from DB ───────────────────────
  // Dans loadIndustries()
loadIndustries(): void {
  this.loadingIndustries = true;
  this.industryError = null;

  this.svc.getIndustries().subscribe({
    next: (response) => {
      // Kendo retourne { data: [], total: N }
      this.industries = response?.data ?? response ?? [];
      this.loadingIndustries = false;
    },
    error: (err) => {
      this.industryError = err.message ?? 'Erreur chargement industries.';
      this.loadingIndustries = false;
    }
  });
}

  // ── Navigation ────────────────────────────────────
  selectIndustry(ind: Industry | null): void {
    this.selectedIndustry = ind;   // null = All, Industry = specific
    this.loadActivities();
  }

  goBack(): void {
    this.selectedIndustry = undefined;
    this.activities = [];
    this.columns = [];
    this.activityError = null;
  }

  // ── Load activities ───────────────────────────────
  loadActivities(): void {
    this.loadingActivities = true;
    this.activityError = null;
    this.activities = [];
    this.columns = [];

    this.svc.getActivities().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
        this.activities = list;
        this.columns = list.length
          ? Object.keys(list[0])
          : [];
        this.loadingActivities = false;
      },
      error: (err) => {
        this.activityError = err.error?.message ?? err.message ?? 'Erreur chargement activités.';
        this.loadingActivities = false;
      }
    });
  }

  toDisplay(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  // ── Modal ─────────────────────────────────────────
  openAddModal(): void {
    this.form = { codeIndustry: '', labelIndustry: '', descriptionIndustry: '' };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveIndustry(): void {
  if (!this.form.codeIndustry || !this.form.labelIndustry) return;
  this.saving = true;

  this.svc.addIndustry(this.form).subscribe({
    next: (response) => {
      // Recharge toutes les industries depuis le serveur
      // pour avoir la nouvelle card avec l'ID correct
      this.loadIndustries();
      this.saving = false;
      this.closeModal();
    },
    error: (err) => {
      console.error('Save industry error:', err);
      this.saving = false;
    }
  });
}
}