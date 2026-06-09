import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { GridModule } from "@progress/kendo-angular-grid";
import { AsyncPipe } from "@angular/common";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import { map } from "rxjs";
import * as ModulesActions from "./+state/modules.actions";
import * as ModulesSelectors from "./+state/modules.selectors";

@Component({
  selector: "app-modules-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, AsyncPipe],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="Modules"
        subtitle="Catalog and activation"
        badge="Catalog"
        [actions]="actions"
      />

      <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-card p-4 shadow-card">
        <kendo-grid [data]="modules$ | async" [loading]="(loading$ | async) ?? false" [height]="420">
          <kendo-grid-column field="code" title="Code" [width]="120"></kendo-grid-column>
          <kendo-grid-column field="name" title="Name" [width]="200"></kendo-grid-column>
          <kendo-grid-column field="description" title="Description"></kendo-grid-column>
          <kendo-grid-column field="isActive" title="Active" [width]="100">
            <ng-template kendoGridCellTemplate let-module>
              <span class="text-xs" [class.text-success]="module.isActive" [class.text-rose-200]="!module.isActive">
                {{ module.isActive ? 'Active' : 'Inactive' }}
              </span>
            </ng-template>
          </kendo-grid-column>
          <kendo-grid-column title="Actions" [width]="140">
            <ng-template kendoGridCellTemplate let-module>
              <button kendoButton look="flat" size="small" (click)="toggle(module)">
                {{ module.isActive ? 'Disable' : 'Enable' }}
              </button>
            </ng-template>
          </kendo-grid-column>
        </kendo-grid>
      </div>
    </div>
  `,
})
export class ModulesPageComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly modules$ = this.store.select(ModulesSelectors.selectModules);
  protected readonly loading$ = this.store.select(ModulesSelectors.selectLoading).pipe(map(Boolean));
  protected readonly actions: PageHeaderAction[] = [];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.store.dispatch(ModulesActions.loadModules());
  }

  toggle(module: { id: string; isActive: boolean }): void {
    this.store.dispatch(ModulesActions.updateModule({ id: module.id, changes: { isActive: !module.isActive } }));
  }
}
