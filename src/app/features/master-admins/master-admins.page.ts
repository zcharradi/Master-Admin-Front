import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { GridModule } from "@progress/kendo-angular-grid";
import { AsyncPipe } from "@angular/common";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import { map } from "rxjs";
import * as MasterAdminActions from "./+state/master-admins.actions";
import * as MasterAdminSelectors from "./+state/master-admins.selectors";

@Component({
  selector: "app-master-admins-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, AsyncPipe],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="Master Admins"
        subtitle="Supervision and MFA"
        badge="Security"
        [actions]="actions"
      />

      <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-card p-4 shadow-card">
        <kendo-grid [data]="admins$ | async" [loading]="(loading$ | async) ?? false" [height]="420">
          <kendo-grid-column field="email" title="Email" [width]="220"></kendo-grid-column>
          <kendo-grid-column field="fullName" title="Name" [width]="180"></kendo-grid-column>
          <kendo-grid-column field="hasMfa" title="MFA" [width]="90">
            <ng-template kendoGridCellTemplate let-admin>
              <span class="text-xs" [class.text-success]="admin.hasMfa" [class.text-rose-200]="!admin.hasMfa">
                {{ admin.hasMfa ? 'Enabled' : 'No' }}
              </span>
            </ng-template>
          </kendo-grid-column>
          <kendo-grid-column field="isBlocked" title="Block status" [width]="100">
            <ng-template kendoGridCellTemplate let-admin>
              <span class="text-xs" [class.text-amber-200]="admin.isBlocked" [class.text-success]="!admin.isBlocked">
                {{ admin.isBlocked ? 'Blocked' : 'OK' }}
              </span>
            </ng-template>
          </kendo-grid-column>
          <kendo-grid-column title="Actions" [width]="160">
            <ng-template kendoGridCellTemplate let-admin>
              <button kendoButton look="flat" size="small" (click)="toggleBlocked(admin)">
                {{ admin.isBlocked ? 'Unblock' : 'Block' }}
              </button>
            </ng-template>
          </kendo-grid-column>
        </kendo-grid>
      </div>
    </div>
  `,
})
export class MasterAdminsPageComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly admins$ = this.store.select(MasterAdminSelectors.selectMasterAdmins);
  protected readonly loading$ = this.store.select(MasterAdminSelectors.selectLoading).pipe(map(Boolean));
  protected readonly actions: PageHeaderAction[] = [];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.store.dispatch(MasterAdminActions.loadMasterAdmins());
  }

  toggleBlocked(admin: { id: string; isBlocked?: boolean }): void {
    this.store.dispatch(MasterAdminActions.updateMasterAdmin({ id: admin.id, changes: { isBlocked: !admin.isBlocked } }));
  }
}
