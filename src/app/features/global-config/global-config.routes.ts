import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { GlobalConfigEffects } from "./effects";
import { globalConfigFeature } from "./reducers";
import { GlobalConfigPageComponent } from "./global-config.page";

export const GLOBAL_CONFIG_ROUTES: Routes = [
  {
    path: "",
    component: GlobalConfigPageComponent,
    providers: [provideState(globalConfigFeature), provideEffects([GlobalConfigEffects])],
  },
];
