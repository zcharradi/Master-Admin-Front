import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { TenantsEffects } from "./+state/tenants.effects";
import { tenantsFeature } from "./+state/tenants.reducer";
import { TenantsPageComponent } from "./tenants.page";

export const TENANTS_ROUTES: Routes = [
  {
    path: "",
    component: TenantsPageComponent,
    providers: [provideState(tenantsFeature), provideEffects([TenantsEffects])],
  },
];