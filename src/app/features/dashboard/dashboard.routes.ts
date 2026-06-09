import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { DashboardEffects } from "./+state/dashboard.effects";
import { dashboardFeature } from "./+state/dashboard.reducer";
import { DashboardPageComponent } from "./dashboard.page";

export const DASHBOARD_ROUTES: Routes = [
  {
    path: "",
    component: DashboardPageComponent,
    providers: [provideState(dashboardFeature), provideEffects([DashboardEffects])],
  },
];
