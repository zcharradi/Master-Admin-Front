import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { GridModule } from "@progress/kendo-angular-grid";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { AsyncPipe, NgIf } from "@angular/common";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import { map } from "rxjs";
import * as DbActions from "./+state/db-instances.actions";
import * as DbSelectors from "./+state/db-instances.selectors";

@Component({
  selector: "app-db-instances-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, InputsModule, ReactiveFormsModule, NgIf, AsyncPipe],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="DB Instances"
        subtitle="PostgreSQL instances inventory"
        badge="Infrastructure"
        [actions]="actions"
      />

      <div class="rounded-2xl card-surface p-4 shadow-card">
        <kendo-grid [data]="instances$ | async" [loading]="(loading$ | async) ?? false" [height]="420">
          <kendo-grid-column field="name" title="Instance" [width]="170"></kendo-grid-column>
          <kendo-grid-column field="host" title="Host" [width]="160"></kendo-grid-column>
          <kendo-grid-column field="dbName" title="Database" [width]="130"></kendo-grid-column>
          <kendo-grid-column field="port" title="Port" [width]="90"></kendo-grid-column>
          <kendo-grid-column field="tenantCount" title="Tenants" [width]="90"></kendo-grid-column>
          <kendo-grid-column field="isActive" title="Status" [width]="120">
            <ng-template kendoGridCellTemplate let-item>
              <span
                class="px-2 py-1 rounded-full text-xs"
                [class.bg-emerald-500/20]="item.isActive"
                [class.text-success]="item.isActive"
                [class.bg-rose-500/20]="!item.isActive"
                [class.text-rose-200]="!item.isActive"
              >
                {{ item.isActive ? 'Active' : 'Inactive' }}
              </span>
            </ng-template>
          </kendo-grid-column>
          <kendo-grid-column title="Actions" [width]="180">
            <ng-template kendoGridCellTemplate let-item>
              <button kendoButton look="flat" size="small" (click)="select(item.id)">Details</button>
              <button kendoButton look="outline" size="small" (click)="toggle(item)">
                {{ item.isActive ? 'Disable' : 'Enable' }}
              </button>
            </ng-template>
          </kendo-grid-column>
        </kendo-grid>
      </div>

      <div *ngIf="selected$ | async as selected" class="rounded-2xl card-surface p-4 shadow-card">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-xs text-lagoon uppercase tracking-[0.3em]">Security</p>
            <h3 class="text-lg font-semibold text-theme-primary">Masked credentials</h3>
            <p class="text-sm text-theme-muted">Admin, user and read-only passwords are never displayed.</p>
          </div>
          <button kendoButton look="outline" (click)="select(null)">Close</button>
        </div>
        <form class="grid gap-3 md:grid-cols-3" [formGroup]="credentialsForm" (ngSubmit)="updateCredentials(selected.id)">
          <label class="text-sm text-theme-primary">
            Admin password
            <input kendoTextBox type="password" formControlName="adminPassword" class="mt-1 w-full" placeholder="••••" />
          </label>
          <label class="text-sm text-theme-primary">
            User password
            <input kendoTextBox type="password" formControlName="password" class="mt-1 w-full" placeholder="••••" />
          </label>
          <label class="text-sm text-theme-primary">
            Read only
            <input kendoTextBox type="password" formControlName="readOnlyPassword" class="mt-1 w-full" placeholder="••••" />
          </label>
          <div class="md:col-span-3 flex justify-end">
            <button kendoButton [primary]="true" type="submit" [disabled]="credentialsForm.invalid">Update</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class DbInstancesPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  protected readonly instances$ = this.store.select(DbSelectors.selectDbInstances);
  protected readonly loading$ = this.store.select(DbSelectors.selectLoading).pipe(map(Boolean));
  protected readonly selected$ = this.store.select(DbSelectors.selectSelectedDbInstance);
  protected readonly actions: PageHeaderAction[] = [];

  protected credentialsForm = this.fb.group({
    adminPassword: ["", Validators.required],
    password: ["", Validators.required],
    readOnlyPassword: ["", Validators.required],
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.store.dispatch(DbActions.loadDbInstances());
  }

  select(id: string | null): void {
    this.store.dispatch(DbActions.selectDbInstance({ id }));
  }

  toggle(item: { id: string; isActive: boolean }): void {
    this.store.dispatch(DbActions.updateDbInstance({ id: item.id, changes: { isActive: !item.isActive } }));
  }

  updateCredentials(id: string): void {
    if (this.credentialsForm.invalid) return;
    const payload = this.credentialsForm.getRawValue();
    this.store.dispatch(
      DbActions.updateDbCredentials({
        id,
        payload: {
          adminPassword: payload.adminPassword || undefined,
          password: payload.password || undefined,
          readOnlyPassword: payload.readOnlyPassword || undefined,
        },
      })
    );
    this.credentialsForm.reset();
  }
}
