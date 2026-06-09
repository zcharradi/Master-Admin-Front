import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { DbInstancesEffects } from "./+state/db-instances.effects";
import { dbInstancesFeature } from "./+state/db-instances.reducer";
import { DbInstancesPageComponent } from "./db-instances.page";

export const DB_INSTANCE_ROUTES: Routes = [
  {
    path: "",
    component: DbInstancesPageComponent,
    providers: [provideState(dbInstancesFeature), provideEffects([DbInstancesEffects])],
  },
];