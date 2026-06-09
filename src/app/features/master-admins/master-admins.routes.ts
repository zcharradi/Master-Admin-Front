import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { MasterAdminsEffects } from "./+state/master-admins.effects";
import { masterAdminsFeature } from "./+state/master-admins.reducer";
import { MasterAdminsPageComponent } from "./master-admins.page";

export const MASTER_ADMIN_ROUTES: Routes = [
  {
    path: "",
    component: MasterAdminsPageComponent,
    providers: [provideState(masterAdminsFeature), provideEffects([MasterAdminsEffects])],
  },
];