import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { GridModule } from "@progress/kendo-angular-grid";
import { AsyncPipe } from "@angular/common";
import { map } from "rxjs";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import * as IndustriesActions from "./+state/industries.actions";
import * as IndustriesSelectors from "./+state/industries.selectors";

@Component({
  selector: "app-industries-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, AsyncPipe],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="Industries"
        subtitle="Industry catalog"
        badge="Catalog"
        [actions]="actions"
      />

      <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-card p-4 shadow-card">
        <kendo-grid [data]="industries$ | async" [loading]="(loading$ | async) ?? false" [height]="420">
          <kendo-grid-column field="code" title="Code" [width]="120"></kendo-grid-column>
          <kendo-grid-column field="label" title="Label"></kendo-grid-column>
          <kendo-grid-column field="isActive" title="Active" [width]="100">
            <ng-template kendoGridCellTemplate let-industry>
              <span class="text-xs" [class.text-success]="industry.isActive" [class.text-rose-200]="!industry.isActive">
                {{ industry.isActive ? 'Active' : 'Inactive' }}
              </span>
            </ng-template>
          </kendo-grid-column>
          <kendo-grid-column title="Actions" [width]="140">
            <ng-template kendoGridCellTemplate let-industry>
              <button kendoButton look="flat" size="small" (click)="toggle(industry)">
                {{ industry.isActive ? 'Disable' : 'Enable' }}
              </button>
            </ng-template>
          </kendo-grid-column>
        </kendo-grid>
      </div>
    </div>
  `,
})
export class IndustriesPageComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly industries$ = this.store.select(IndustriesSelectors.selectIndustries);
  protected readonly loading$ = this.store.select(IndustriesSelectors.selectLoading).pipe(map(Boolean));
  protected readonly actions: PageHeaderAction[] = [];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.store.dispatch(IndustriesActions.loadIndustries());
  }

  toggle(industry: { id: string; isActive: boolean }): void {
    this.store.dispatch(IndustriesActions.updateIndustry({ id: industry.id, changes: { isActive: !industry.isActive } }));
  }
}
