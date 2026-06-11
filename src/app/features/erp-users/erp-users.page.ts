import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { GridModule } from "@progress/kendo-angular-grid";
import { AsyncPipe } from "@angular/common";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import { map } from "rxjs";
import * as ErpUserActions from "./actions";
import * as ErpUserSelectors from "./reducers";

@Component({
  selector: "app-erp-users-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, AsyncPipe],
  templateUrl: './erp-users.page.html',
  styleUrls: ['./erp-users.page.scss'],
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
