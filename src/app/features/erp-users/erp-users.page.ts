import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { GridModule } from "@progress/kendo-angular-grid";
import { AsyncPipe } from "@angular/common";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import { map } from "rxjs";
import * as ErpUserActions from "./+state/erp-users.actions";
import * as ErpUserSelectors from "./+state/erp-users.selectors";

@Component({
  selector: "app-erp-users-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, AsyncPipe],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="ERP Users"
        subtitle="Application-side ERP accounts"
        badge="Users"
        [actions]="actions"
      />

      <div class="rounded-2xl card-surface p-4 shadow-card">
        <kendo-grid [data]="users$ | async" [loading]="(loading$ | async) ?? false" [height]="420">
          <kendo-grid-column field="email" title="Email" [width]="220"></kendo-grid-column>
          <kendo-grid-column field="fullName" title="Name" [width]="180"></kendo-grid-column>
          <kendo-grid-column field="isActive" title="Active" [width]="100">
            <ng-template kendoGridCellTemplate let-user>
              <span class="px-2 py-1 rounded-full text-xs" [class.bg-emerald-500/20]="user.isActive" [class.text-success]="user.isActive" [class.bg-rose-500/20]="!user.isActive" [class.text-rose-200]="!user.isActive">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
            </ng-template>
          </kendo-grid-column>
          <kendo-grid-column field="isBlocked" title="Block status" [width]="110">
            <ng-template kendoGridCellTemplate let-user>
              <span class="px-2 py-1 rounded-full text-xs" [class.bg-amber-500/20]="user.isBlocked" [class.text-amber-100]="user.isBlocked" [class.bg-emerald-500/20]="!user.isBlocked" [class.text-success]="!user.isBlocked">
                {{ user.isBlocked ? 'Blocked' : 'OK' }}
              </span>
            </ng-template>
          </kendo-grid-column>
          <kendo-grid-column field="resetPasswordIsNeeded" title="Reset" [width]="100">
            <ng-template kendoGridCellTemplate let-user>
              <span class="text-xs text-theme-primary">{{ user.resetPasswordIsNeeded ? 'Required' : 'No' }}</span>
            </ng-template>
          </kendo-grid-column>
          <kendo-grid-column title="Actions" [width]="200">
            <ng-template kendoGridCellTemplate let-user>
              <button kendoButton look="flat" size="small" (click)="toggleActive(user)">
                {{ user.isActive ? 'Disable' : 'Enable' }}
              </button>
              <button kendoButton look="outline" size="small" (click)="toggleBlocked(user)">
                {{ user.isBlocked ? 'Unblock' : 'Block' }}
              </button>
            </ng-template>
          </kendo-grid-column>
        </kendo-grid>
      </div>
    </div>
  `,
})
export class ErpUsersPageComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly users$ = this.store.select(ErpUserSelectors.selectErpUsers);
  protected readonly loading$ = this.store.select(ErpUserSelectors.selectLoading).pipe(map(Boolean));
  protected readonly actions: PageHeaderAction[] = [];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.store.dispatch(ErpUserActions.loadErpUsers());
  }

  toggleActive(user: { id: string; isActive: boolean }): void {
    this.store.dispatch(ErpUserActions.updateErpUser({ id: user.id, changes: { isActive: !user.isActive } }));
  }

  toggleBlocked(user: { id: string; isBlocked: boolean }): void {
    this.store.dispatch(ErpUserActions.updateErpUser({ id: user.id, changes: { isBlocked: !user.isBlocked } }));
  }
}
