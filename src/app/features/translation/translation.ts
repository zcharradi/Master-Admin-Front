import { Component, OnInit, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslationService, TranslationRow } from './translation.service';
import { ActivatedRoute } from '@angular/router';
import { KENDO_GRID, CellCloseEvent, CreateFormGroupArgs, GridComponent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, KENDO_GRID],
  templateUrl: './translation.html',
  styleUrls: ['./translation.scss'],
})
export class TranslationComponent implements OnInit {
  private readonly svc = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('grid') grid!: GridComponent;

  menu = 'articles';
  translations: TranslationRow[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  saving = false;
  isDirty = false;

  pageSize = 10;
  pageSizes = [5, 10, 20, 50];

  originalValues: Map<string, { fr: string | null; de: string | null }> = new Map();

  private readonly menuLabels: Record<string, string> = {
    'articles': 'Articles',
    'operations': 'Operations',
    'dossiers': 'Documents',
    'vat': 'VAT / TVA',
    'comptabilite': 'Chart of Accounts',
  };

  get menuLabel(): string {
    return this.menuLabels[this.menu]
      ?? this.menu.charAt(0).toUpperCase() + this.menu.slice(1);
  }

  createFormGroup = (args: CreateFormGroupArgs): FormGroup => {
    const dataItem = args.dataItem as TranslationRow;
    return new FormGroup({
      editFr: new FormControl(dataItem.editFr ?? ''),
      editDe: new FormControl(dataItem.editDe ?? ''),
    });
  };

  rowClass = (context: { dataItem: TranslationRow }) => ({
    'dirty-row': this.isRowDirty(context.dataItem)
  });

  get hasDirtyRows(): boolean {
    return this.isDirty;
  }

  isRowDirty(row: TranslationRow): boolean {
    const orig = this.originalValues.get(row.sourceLabel);
    if (!orig) return false;
    return row.editFr !== orig.fr || row.editDe !== orig.de;
  }

  ngOnInit(): void {
    this.menu = this.route.snapshot.data['menu'] ?? 'articles';
    this.loadTranslations();
  }

  gridVisible = true;

  loadTranslations(): void {
    this.loading = true;
    this.error = null;
    this.isDirty = false;
    this.originalValues.clear();
    this.gridVisible = false;

    this.svc.getTranslations(this.menu).subscribe({
      next: (res: any) => {
        const rows = (res.data ?? []).map((x: any) => {
          const row: TranslationRow = {
            sourceLabel: x.source_label ?? '',
            idFr: x.id_fr,
            translatedLabelFr: x.translated_label_fr ?? null,
            idDe: x.id_de,
            translatedLabelDe: x.translated_label_de ?? null,
            editing: false,
            editFr: x.translated_label_fr ?? null,
            editDe: x.translated_label_de ?? null,
          };
          this.originalValues.set(row.sourceLabel, {
            fr: row.editFr ?? null,
            de: row.editDe ?? null,
          });
          return row;
        });

        this.translations = rows;
        this.loading = false;

        setTimeout(() => {
          this.gridVisible = true;
          this.cdr.detectChanges();
        }, 50);
      },
      error: () => {
        this.error = 'Erreur chargement traductions ❌';
        this.loading = false;
        this.gridVisible = true;
        this.cdr.detectChanges();
      }
    });
  }

  onCellClose(e: CellCloseEvent): void {
    const formGroup = e.formGroup;
    if (!formGroup || !formGroup.dirty) return;
    const dataItem: TranslationRow = e.dataItem;
    dataItem.editFr = formGroup.get('editFr')?.value ?? dataItem.editFr;
    dataItem.editDe = formGroup.get('editDe')?.value ?? dataItem.editDe;
    this.isDirty = true;
    this.cdr.detectChanges();
  }

  saveAll(): void {
    this.saving = true;
    const calls: Promise<any>[] = [];

    for (const row of this.translations) {
      if (!this.isRowDirty(row)) continue;
      const orig = this.originalValues.get(row.sourceLabel)!;

      if (row.editFr !== orig.fr) {
        calls.push(this.svc.updateFr(row.idFr, row.editFr ?? '').toPromise());
      }
      if (row.editDe !== orig.de) {
        calls.push(this.svc.updateDe(row.idDe, row.editDe ?? '').toPromise());
      }
    }

    Promise.all(calls).then(() => {
      for (const row of this.translations) {
        row.translatedLabelFr = row.editFr ?? null;
        row.translatedLabelDe = row.editDe ?? null;
        this.originalValues.set(row.sourceLabel, {
          fr: row.editFr ?? null,
          de: row.editDe ?? null,
        });
      }
      this.saving = false;
      this.isDirty = false;
      this.successMessage = 'Traductions mises à jour avec succès !';
      setTimeout(() => (this.successMessage = null), 3000);
      this.cdr.detectChanges();
    }).catch(() => {
      this.error = 'Erreur lors de la sauvegarde ❌';
      this.saving = false;
      this.cdr.detectChanges();
    });
  }

  cancelAll(): void {
    for (const row of this.translations) {
      const orig = this.originalValues.get(row.sourceLabel);
      if (orig) {
        row.editFr = orig.fr;
        row.editDe = orig.de;
      }
    }
    this.isDirty = false;
    this.translations = [...this.translations];
    this.cdr.detectChanges();
  }

  onCellClick(): void {}
}