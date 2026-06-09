import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { ReferencesEffects } from "./+state/references.effects";
import { referencesFeature } from "./+state/references.reducer";
import { ReferencesPageComponent } from "./references.page";

export const REFERENCE_ROUTES: Routes = [
  {
    path: "",
    component: ReferencesPageComponent,
    providers: [provideState(referencesFeature), provideEffects([ReferencesEffects])],
  },
];