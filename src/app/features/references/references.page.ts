import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { GridModule } from "@progress/kendo-angular-grid";
import { AsyncPipe, NgFor, NgIf } from "@angular/common";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import * as ReferencesActions from "./+state/references.actions";
import * as ReferencesSelectors from "./+state/references.selectors";

@Component({
  selector: "app-references-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, NgFor, NgIf, AsyncPipe],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="References"
        subtitle="Countries, currencies, email templates"
        badge="Data"
        [actions]="actions"
      />

      <ng-container *ngIf="data$ | async as data">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl card-surface p-4 shadow-card">
            <h3 class="text-lg font-semibold text-theme-primary mb-2">Countries</h3>
            <ul class="grid grid-cols-2 gap-2 text-sm text-theme-primary max-h-56 overflow-auto">
              <li *ngFor="let country of data.countries" class="px-2 py-1 rounded bg-white/40">{{ country }}</li>
            </ul>
          </div>
          <div class="rounded-2xl card-surface p-4 shadow-card">
            <h3 class="text-lg font-semibold text-theme-primary mb-2">Currencies</h3>
            <div class="flex flex-wrap gap-2 text-sm">
              <span *ngFor="let currency of data.currencies" class="px-2 py-1 rounded bg-white/40 text-theme-primary">{{ currency }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl card-surface p-4 shadow-card">
          <h3 class="text-lg font-semibold text-theme-primary mb-3">Email Templates</h3>
          <kendo-grid [data]="data.mailTemplates" [height]="300">
            <kendo-grid-column field="name" title="Name" [width]="200"></kendo-grid-column>
            <kendo-grid-column field="subject" title="Subject"></kendo-grid-column>
          </kendo-grid>
        </div>
      </ng-container>
    </div>
  `,
})
export class ReferencesPageComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly data$ = this.store.select(ReferencesSelectors.selectData);
  protected readonly loading$ = this.store.select(ReferencesSelectors.selectLoading);
  protected readonly actions: PageHeaderAction[] = [];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.store.dispatch(ReferencesActions.loadReferences());
  }
}
