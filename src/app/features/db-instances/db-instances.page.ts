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
import * as DbActions from "./actions";
import * as DbSelectors from "./reducers";

@Component({
  selector: "app-db-instances-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, InputsModule, ReactiveFormsModule, NgIf, AsyncPipe],
  templateUrl: './db-instances.page.html',
  styleUrls: ['./db-instances.page.scss'],
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
