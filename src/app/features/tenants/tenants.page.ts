import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { DropDownsModule } from "@progress/kendo-angular-dropdowns";
import { GridModule } from "@progress/kendo-angular-grid";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { AsyncPipe } from "@angular/common";
import { DialogsModule } from "@progress/kendo-angular-dialog";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import { SdsKendoGridComponent } from "@app/shared/components/sds-kendo-grid.component";
import { BehaviorSubject, combineLatest, map, shareReplay } from "rxjs";
import * as TenantsActions from "./+state/tenants.actions";
import * as TenantsSelectors from "./+state/tenants.selectors";
import { GridDataResult, DataStateChangeEvent } from "@progress/kendo-angular-grid";
import { State, process } from "@progress/kendo-data-query";
import { DbInstancesApiService } from "@app/core/services/db-instances-api.service";
import { DbInstance } from "@app/features/db-instances/+state/db-instances.models";

@Component({
  selector: "app-tenants-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PageHeaderComponent,
    GridModule,
    InputsModule,
    ButtonsModule,
    DropDownsModule,
    AsyncPipe,
    SdsKendoGridComponent,
    DialogsModule,
  ],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="Tenants"
        subtitle="Multi-tenant management and DB assignment"
        badge="Directory"
        [actions]="actions"
      />

      <div class="grid gap-4 md:grid-cols-3">
        <label class="text-sm text-theme-primary">
          Search
          <input
            kendoTextBox
            class="mt-1 w-full"
            [ngModel]="search"
            (ngModelChange)="onSearch($event)"
            placeholder="Name or UUID"
          />
        </label>
        <label class="text-sm text-theme-primary">
          Status
          <kendo-dropdownlist
            class="mt-1 w-full"
            [data]="statusOptions"
            textField="label"
            valueField="value"
            [value]="filterStatus"
            (valueChange)="onStatusChange($event)"
          ></kendo-dropdownlist>
        </label>
        <label class="text-sm text-theme-primary">
          DB assignment
          <input kendoTextBox class="mt-1 w-full" placeholder="db_instance_id" disabled />
        </label>
      </div>

      <div class="card-surface shadow-card rounded-2xl p-0 overflow-hidden" *ngIf="gridView$ | async as grid">
        <sds-kendo-grid
          [data]="grid"
          [state]="gridState"
          [loading]="(loading$ | async) ?? false"
          [height]="420"
          (stateChange)="onGridStateChange($event)"
          (refresh)="refresh()"
        >
          <kendo-grid-column field="uuid" title="UUID" [width]="160"></kendo-grid-column>
          <kendo-grid-column field="entityName" title="Entity" [width]="200"></kendo-grid-column>
          <kendo-grid-column field="dbInstanceId" title="DB Instance" [width]="140"></kendo-grid-column>
          <kendo-grid-column field="isActive" title="Active" [width]="90">
            <ng-template kendoGridCellTemplate let-dataItem>
              <span
                class="px-2 py-1 rounded-full text-xs"
                [class.bg-emerald-500/20]="dataItem.isActive"
                [class.text-success]="dataItem.isActive"
                [class.bg-rose-500/20]="!dataItem.isActive"
                [class.text-rose-200]="!dataItem.isActive"
              >
                {{ dataItem.isActive ? 'Active' : 'Inactive' }}
              </span>
            </ng-template>
          </kendo-grid-column>
          <kendo-grid-column title="Actions" [width]="150">
            <ng-template kendoGridCellTemplate let-dataItem>
              <button kendoButton look="flat" size="small" (click)="select(dataItem.id)">Details</button>
              <button kendoButton look="outline" size="small" (click)="disable(dataItem.id)" [disabled]="!dataItem.isActive">Disable</button>
            </ng-template>
          </kendo-grid-column>
        </sds-kendo-grid>
      </div>

      <kendo-dialog *ngIf="showCreateModal" (close)="closeModal()">
        <kendo-dialog-titlebar>
          New tenant
        </kendo-dialog-titlebar>
        <form class="space-y-4" [formGroup]="createForm" (ngSubmit)="create()">
          <label class="block text-sm text-theme-primary">
            UUID
            <input kendoTextBox formControlName="uuid" class="mt-1 w-full" placeholder="auto or manual" />
          </label>
          <label class="block text-sm text-theme-primary">
            Entity name
            <input kendoTextBox formControlName="entityName" class="mt-1 w-full" placeholder="Company" />
          </label>
          <label class="block text-sm text-theme-primary">
            DB Instance
            <kendo-dropdownlist
              class="mt-1 w-full"
              [data]="dbInstances$ | async"
              textField="name"
              valueField="id"
              [valuePrimitive]="true"
              formControlName="dbInstanceId"
              [defaultItem]="{ name: 'Select an instance', id: '' }"
            ></kendo-dropdownlist>
          </label>
        </form>
        <kendo-dialog-actions>
          <button kendoButton look="flat" (click)="closeModal()">Cancel</button>
          <button kendoButton [primary]="true" [disabled]="createForm.invalid" (click)="create()">Create</button>
        </kendo-dialog-actions>
      </kendo-dialog>
    </div>
  `,
})
export class TenantsPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly dbInstancesApi = inject(DbInstancesApiService);

  protected readonly tenants$ = this.store.select(TenantsSelectors.selectTenants);
  protected readonly loading$ = this.store.select(TenantsSelectors.selectLoading).pipe(map(Boolean));
  protected readonly actions: PageHeaderAction[] = [
    { label: "New tenant", look: "outline", onClick: () => this.openModal() },
  ];
  protected gridState: State = { skip: 0, take: 10, filter: { logic: "and", filters: [] }, sort: [] };
  private readonly gridState$ = new BehaviorSubject<State>(this.gridState);
  protected readonly gridView$ = combineLatest([this.tenants$, this.gridState$]).pipe(
    map(([items, state]): GridDataResult => process(items ?? [], state))
  );
  protected readonly dbInstances$ = this.dbInstancesApi.list({ pageSize: 100 }).pipe(
    map((resp) => resp.data ?? []),
    shareReplay(1)
  );
  protected showCreateModal = false;

  protected search = "";
  protected filterStatus: boolean | null = null;
  protected statusOptions = [
    { label: "All", value: null },
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  protected createForm = this.fb.group({
    uuid: [""],
    entityName: ["", Validators.required],
    dbInstanceId: [""],
  });

  ngOnInit(): void {
    this.refresh();
  }

  onGridStateChange(state: State | DataStateChangeEvent): void {
    this.gridState = state;
    this.gridState$.next(this.gridState);
  }

  refresh(): void {
    this.store.dispatch(TenantsActions.loadTenants({ filters: { search: this.search || undefined, isActive: this.filterStatus ?? undefined } }));
  }

  onSearch(value: string): void {
    this.search = value;
    this.refresh();
  }

  onStatusChange(value: boolean | null): void {
    this.filterStatus = value;
    this.refresh();
  }

  openModal(): void {
    this.showCreateModal = true;
    this.createForm.reset({ uuid: crypto.randomUUID(), entityName: "", dbInstanceId: "" });
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.createForm.reset({ uuid: "", entityName: "", dbInstanceId: "" });
  }

  select(id: string): void {
    this.store.dispatch(TenantsActions.selectTenant({ id }));
  }

  disable(id: string): void {
    this.store.dispatch(TenantsActions.updateTenant({ id, changes: { isActive: false } }));
  }

  create(): void {
    if (this.createForm.invalid) return;
    const { uuid, entityName, dbInstanceId } = this.createForm.getRawValue();
    this.store.dispatch(
      TenantsActions.createTenant({
        payload: {
          uuid: uuid || crypto.randomUUID(),
          entityName: entityName ?? "",
          dbInstanceId: dbInstanceId ?? undefined,
          isActive: true,
        },
      })
    );
    this.closeModal();
  }
}
