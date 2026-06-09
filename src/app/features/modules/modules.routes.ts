import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { ModulesEffects } from "./+state/modules.effects";
import { modulesFeature } from "./+state/modules.reducer";
import { ModulesPageComponent } from "./modules.page";

export const MODULE_ROUTES: Routes = [
  {
    path: "",
    component: ModulesPageComponent,
    providers: [provideState(modulesFeature), provideEffects([ModulesEffects])],
  },
];