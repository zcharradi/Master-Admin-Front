/*import { CommonModule } from "@angular/common";
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
}*/





import { Component, OnInit, inject, ElementRef, ViewChild, HostListener } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { AsyncPipe, CommonModule } from "@angular/common";

import { DialogsModule } from "@progress/kendo-angular-dialog";
import {
  GridModule,
  GridDataResult,
  DataStateChangeEvent,
  GridComponent,
  ExcelComponent, PDFComponent
} from "@progress/kendo-angular-grid";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { DropDownsModule } from "@progress/kendo-angular-dropdowns";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { PopupModule } from "@progress/kendo-angular-popup";
import { BehaviorSubject, combineLatest, map, of } from "rxjs";
import { State, process } from "@progress/kendo-data-query";

import * as TenantsActions from "./actions";
import * as TenantsSelectors from "./reducers";

import { PageHeaderComponent } from "@app/shared/components/page-header.component";
import { arrowRotateCwIcon, checkboxCheckedIcon, columnsIcon, downloadIcon, gearIcon } from '@progress/kendo-svg-icons';
import { ExcelExportModule } from '@progress/kendo-angular-excel-export';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';

interface Tenant {
  id: string;
  uuid: string;
  entityName: string;
  dbInstanceId?: string;
  isActive: boolean;
}

interface ColumnConfig {
  field: string;
  title: string;
  visible: boolean;
}

@Component({
  selector: "app-tenants-page",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    GridModule,
    ButtonsModule,
    DropDownsModule,
    InputsModule,
    PopupModule,
    ExcelExportModule,
    PDFExportModule,
    CommonModule,
    AsyncPipe,
    DialogsModule,
    PageHeaderComponent,
    ExcelComponent,
    PDFComponent
  ],
  templateUrl: "./tenants.page.html",
  styleUrl: "./tenants.page.scss",
})
export class TenantsPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  protected readonly actions = [
    { label: "New Tenant", icon: "plus", onClick: () => this.openModal() }
  ];

  protected search = "";
  protected filterStatus: boolean | null = null;
  protected readonly statusOptions = [
    { label: "All", value: null },
    { label: "Active", value: true },
    { label: "Inactive", value: false }
  ];

  protected readonly tenants$ = this.store.select(TenantsSelectors.selectTenants);
  protected readonly loading$ = this.store.select(TenantsSelectors.selectLoading);
  protected readonly dbInstances$ = of([
    { id: "db1", name: "Database 1" },
    { id: "db2", name: "Database 2" }
  ]);

  protected gridState: State = {
    skip: 0,
    take: 10,
    sort: [],
    filter: { logic: "and", filters: [] }
  };
  private readonly gridState$ = new BehaviorSubject<State>(this.gridState);
  protected selectedKeys: string[] = [];

  protected readonly selectableSettings = {
    checkboxOnly: true,
    mode: 'multiple' as const
  };

  protected onSelectionChange(): void {
    console.log('Lignes sélectionnées:', this.selectedKeys);
  }

  protected get hasSelection(): boolean {
    return this.selectedKeys.length > 0;
  }

  protected readonly gridView$ = combineLatest([this.tenants$, this.gridState$]).pipe(
    map(([items, state]): GridDataResult => {
      const data = (items as Tenant[]) ?? [];
      const result = process(data, state);
      return {
        data: result.data as Tenant[],
        total: result.total
      };
    })
  );

  protected readonly columnsIcon = columnsIcon;
  protected readonly downloadIcon = downloadIcon;
  protected readonly checkboxCheckedIcon = checkboxCheckedIcon;
  protected readonly arrowRotateCwIcon = arrowRotateCwIcon;
  protected readonly gearIcon = gearIcon;

  @ViewChild(GridComponent) protected grid!: GridComponent;

  // ============================================
  // COLUMN CHOOSER
  // ============================================
  protected readonly allColumns: ColumnConfig[] = [
    { field: "id", title: "Id", visible: true },
    { field: "uuid", title: "UUID", visible: true },
    { field: "entityName", title: "Entity", visible: true },
    { field: "dbInstanceId", title: "DB", visible: true },
    { field: "isActive", title: "Active", visible: true },
  ];

  protected columns: ColumnConfig[] = this.allColumns.map(c => ({ ...c }));
  protected columnSearch = "";
  protected showColumnChooser = false;

  @ViewChild("columnsAnchor", { read: ElementRef }) columnsAnchor!: ElementRef;

  protected get filteredColumns(): ColumnConfig[] {
    if (!this.columnSearch.trim()) return this.columns;
    const term = this.columnSearch.toLowerCase();
    return this.columns.filter(c => c.title.toLowerCase().includes(term));
  }

  protected get selectedCount(): number {
    return this.columns.filter(c => c.visible).length;
  }

  protected get allSelected(): boolean {
    return this.columns.every(c => c.visible);
  }

  protected toggleColumnChooser(event: MouseEvent): void {
    event.stopPropagation();
    this.showColumnChooser = !this.showColumnChooser;
    if (this.showColumnChooser) {
      this.columnSearch = "";
    }
  }

  protected applyColumns(): void {
    this.showColumnChooser = false;
  }

  protected isColumnVisible(field: string): boolean {
    return this.columns.find(c => c.field === field)?.visible ?? true;
  }

  protected toggleColumn(col: ColumnConfig): void {
    col.visible = !col.visible;
  }

  protected toggleSelectAll(): void {
    const next = !this.allSelected;
    this.columns.forEach(c => (c.visible = next));
  }

  protected resetColumns(): void {
    this.columns = this.allColumns.map(c => ({ ...c }));
  }

  // ============================================
  // EXPORT MENU
  // ============================================
  protected showExportMenu = false;

  @ViewChild("exportAnchor", { read: ElementRef }) exportAnchor!: ElementRef;

  protected toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showExportMenu = !this.showExportMenu;
  }

  protected closeExportMenu(): void {
    this.showExportMenu = false;
  }

  protected exportExcel(): void {
    this.grid.saveAsExcel();
    this.closeExportMenu();
  }

  protected exportPdf(): void {
    this.grid.saveAsPDF();
    this.closeExportMenu();
  }

  protected importXml(input: HTMLInputElement): void {
    input.click();
    this.closeExportMenu();
  }

  protected onXmlFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    console.log("Fichier XML sélectionné :", file.name);
  }

  // ============================================
  // SELECTION MENU & FILTERS
  // ============================================
  protected showSelectionMenu = false;
  protected isFilteringSelected = false;

  @ViewChild("selectionAnchor", { read: ElementRef }) selectionAnchor!: ElementRef;

  protected toggleSelectionMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showSelectionMenu = !this.showSelectionMenu;
  }

  protected closeSelectionMenu(): void {
    this.showSelectionMenu = false;
  }

  protected selectAllRows(): void {
    this.tenants$.pipe(map(tenants => tenants ?? [])).subscribe(tenants => {
      this.selectedKeys = tenants.map(t => t.id);
      this.onSelectionChange();
      this.closeSelectionMenu();
    }).unsubscribe();
  }

  protected clearRowSelection(): void {
    this.selectedKeys = [];
    this.onSelectionChange();
    if (this.isFilteringSelected) {
      this.filterSelectedOnly();
    } else {
      this.closeSelectionMenu();
    }
  }

  protected filterSelectedOnly(): void {
    if (!this.gridState.filter) {
      this.gridState.filter = { logic: "and", filters: [] };
    }
    if (!this.gridState.filter.filters) {
      this.gridState.filter.filters = [];
    }

    if (this.isFilteringSelected) {
      this.gridState.filter.filters = this.gridState.filter.filters.filter((f: any) => f.field !== 'id');
      this.isFilteringSelected = false;
    } else {
      if (this.selectedKeys.length > 0) {
        const idFilters = this.selectedKeys.map(id => ({
          field: "id",
          operator: "eq" as const,
          value: id
        }));

        this.gridState.filter.filters.push({
          logic: "or",
          filters: idFilters
        });
        this.isFilteringSelected = true;
      }
    }
    this.gridState$.next(this.gridState);
    this.closeSelectionMenu();
  }

  // ============================================
  // GESTION DES DISPOSITIONS (LAYOUT)
  // ============================================
  protected showDispositionMenu = false;
  private readonly STORAGE_KEY = "tenants_grid_layout";

  @ViewChild("dispositionAnchor", { read: ElementRef }) dispositionAnchor!: ElementRef;

  protected toggleDispositionMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showDispositionMenu = !this.showDispositionMenu;
  }

  protected closeDispositionMenu(): void {
    this.showDispositionMenu = false;
  }

  protected saveCurrentLayout(): void {
    const layoutToSave = {
      gridState: this.gridState,
      columns: this.columns.map(c => ({ field: c.field, visible: c.visible }))
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layoutToSave));
    this.closeDispositionMenu();
    console.log("Disposition enregistrée avec succès.");
  }

  protected clearAllLayouts(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.gridState = {
      skip: 0,
      take: 10,
      sort: [],
      filter: { logic: "and", filters: [] }
    };
    this.columns = this.allColumns.map(c => ({ ...c }));
    this.gridState$.next(this.gridState);
    this.closeDispositionMenu();
    this.refresh();
    console.log("Toutes les dispositions ont été supprimées.");
  }

  private loadSavedLayout(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return;
    try {
      const layout = JSON.parse(saved);
      if (layout.gridState) {
        this.gridState = layout.gridState;
        this.gridState$.next(this.gridState);
      }
      if (layout.columns) {
        this.columns.forEach(col => {
          const savedCol = layout.columns.find((c: any) => c.field === col.field);
          if (savedCol) {
            col.visible = savedCol.visible;
          }
        });
      }
    } catch (e) {
      console.error("Erreur d'importation de la disposition :", e);
    }
  }

  // ============================================
  // FERMETURE GLOBALE AU CLIC EXTÉRIEUR
  // ============================================
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (this.showColumnChooser && this.columnsAnchor?.nativeElement) {
      const clickedAnchor = this.columnsAnchor.nativeElement.contains(target);
      const clickedPanel = target.closest('.column-chooser-panel');
      if (!clickedAnchor && !clickedPanel) {
        this.showColumnChooser = false;
      }
    }

    if (this.showExportMenu && this.exportAnchor?.nativeElement) {
      const clickedAnchor = this.exportAnchor.nativeElement.contains(target);
      const clickedPanel = target.closest('.export-menu-panel');
      if (!clickedAnchor && !clickedPanel) {
        this.showExportMenu = false;
      }
    }

    if (this.showSelectionMenu && this.selectionAnchor?.nativeElement) {
      const clickedAnchor = this.selectionAnchor.nativeElement.contains(target);
      const clickedPanel = target.closest('.selection-menu-panel');
      if (!clickedAnchor && !clickedPanel) {
        this.showSelectionMenu = false;
      }
    }

    if (this.showDispositionMenu && this.dispositionAnchor?.nativeElement) {
      const clickedAnchor = this.dispositionAnchor.nativeElement.contains(target);
      const clickedPanel = target.closest('.disposition-menu-panel');
      if (!clickedAnchor && !clickedPanel) {
        this.showDispositionMenu = false;
      }
    }
  }

  protected createForm = this.fb.group({
    uuid: [""],
    entityName: ["", Validators.required],
    dbInstanceId: [""]
  });
  protected showCreateModal = false;

  ngOnInit(): void {
    this.loadSavedLayout();
    this.refresh();
  }

  protected onGridStateChange(state: DataStateChangeEvent): void {
    this.gridState = state;
    this.gridState$.next(state);
  }

  protected onSearch(value: string): void {
    this.search = value;
    this.refresh();
  }

  protected onStatusChange(value: boolean | null): void {
    this.filterStatus = value;
    this.refresh();
  }

  protected refresh(): void {
    this.store.dispatch(
      TenantsActions.loadTenants({
        filters: {
          search: this.search,
          isActive: this.filterStatus ?? undefined
        }
      })
    );
  }

  protected select(id: string): void {
    this.store.dispatch(TenantsActions.selectTenant({ id }));
  }

  protected disable(id: string): void {
    this.store.dispatch(TenantsActions.updateTenant({ id, changes: { isActive: false } }));
  }

  protected openModal(): void {
    this.showCreateModal = true;
    this.createForm.reset({
      uuid: crypto.randomUUID(),
      entityName: "",
      dbInstanceId: ""
    });
  }

  protected closeModal(): void {
    this.showCreateModal = false;
  }

  protected create(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();

    this.store.dispatch(
      TenantsActions.createTenant({
        payload: {
          uuid: value.uuid || crypto.randomUUID(),
          entityName: value.entityName ?? "",
          dbInstanceId: value.dbInstanceId ?? undefined,
          isActive: true
        }
      })
    );
    this.closeModal();
  }
}
