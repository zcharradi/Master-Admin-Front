import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { ReferencesEffects } from "./effects";
import { referencesFeature } from "./reducers";
import { ReferencesPageComponent } from "./references.page";

export const REFERENCE_ROUTES: Routes = [
  {
    path: "",
    component: ReferencesPageComponent,
    providers: [provideState(referencesFeature), provideEffects([ReferencesEffects])],
  },
];
