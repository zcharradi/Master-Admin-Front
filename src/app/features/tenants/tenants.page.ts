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
import * as TenantsActions from "./actions";
import * as TenantsSelectors from "./reducers";
import { GridDataResult, DataStateChangeEvent } from "@progress/kendo-angular-grid";
import { State, process } from "@progress/kendo-data-query";
import { DbInstanceService } from "@swagger/api/dbInstance.service";
import { DataSourceRequest, DbInstanceDTO } from "@swagger/model/models";

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
  templateUrl: './tenants.page.html',
  styleUrls: ['./tenants.page.scss'],
})
export class TenantsPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly dbApi = inject(DbInstanceService);

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
  protected readonly dbInstances$ = this.dbApi
    .dbInstanceGetAllPost({ pageSize: 100 } as DataSourceRequest)
    .pipe(
      map((resp: any) =>
        ((resp?.data ?? []) as DbInstanceDTO[]).map((dto) => ({
          id: String(dto.id ?? ""),
          name: dto.serverName ?? dto.dbName ?? "",
        }))
      ),
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
    this.store.dispatch(
      TenantsActions.loadTenants({
        filters: { search: this.search || undefined, isActive: this.filterStatus ?? undefined },
      })
    );
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
