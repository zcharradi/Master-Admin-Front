import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { GridModule } from "@progress/kendo-angular-grid";
import { AsyncPipe } from "@angular/common";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import { map } from "rxjs";
import * as MasterAdminActions from "./actions";
import * as MasterAdminSelectors from "./reducers";

@Component({
  selector: "app-master-admins-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, AsyncPipe],
  templateUrl: './master-admins.page.html',
  styleUrls: ['./master-admins.page.scss'],
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
