import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { GridModule } from "@progress/kendo-angular-grid";
import { AsyncPipe, NgFor, NgIf } from "@angular/common";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import * as ReferencesActions from "./actions";
import * as ReferencesSelectors from "./reducers";

@Component({
  selector: "app-references-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, NgFor, NgIf, AsyncPipe],
  templateUrl: './references.page.html',
  styleUrls: ['./references.page.scss'],
})
export class ReferencesPageComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly data$ = this.store.select(ReferencesSelectors.selectData);
  protected readonly loading$ = this.store.select(ReferencesSelectors.selectLoading);
  protected readonly actions: PageHeaderAction[] = [];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.store.dispatch(ReferencesActions.loadReferences());
  }
}
