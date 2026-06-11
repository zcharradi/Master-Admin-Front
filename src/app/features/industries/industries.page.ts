import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { GridModule } from "@progress/kendo-angular-grid";
import { AsyncPipe } from "@angular/common";
import { map } from "rxjs";

import { PageHeaderAction, PageHeaderComponent } from "@app/shared/components/page-header.component";
import * as IndustriesActions from "./actions";
import * as IndustriesSelectors from "./reducers";

@Component({
  selector: "app-industries-page",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GridModule, ButtonsModule, AsyncPipe],
  templateUrl: './industries.page.html',
  styleUrls: ['./industries.page.scss'],
})
export class IndustriesPageComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly industries$ = this.store.select(IndustriesSelectors.selectIndustries);
  protected readonly loading$ = this.store.select(IndustriesSelectors.selectLoading).pipe(map(Boolean));
  protected readonly actions: PageHeaderAction[] = [];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.store.dispatch(IndustriesActions.loadIndustries());
  }

  toggle(industry: { id: string; isActive: boolean }): void {
    this.store.dispatch(IndustriesActions.updateIndustry({ id: industry.id, changes: { isActive: !industry.isActive } }));
  }
}
