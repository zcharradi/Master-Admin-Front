import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { ErpUsersEffects } from "./effects";
import { erpUsersFeature } from "./reducers";
import { ErpUsersPageComponent } from "./erp-users.page";

export const ERP_USER_ROUTES: Routes = [
  {
    path: "",
    component: ErpUsersPageComponent,
    providers: [provideState(erpUsersFeature), provideEffects([ErpUsersEffects])],
  },
];
