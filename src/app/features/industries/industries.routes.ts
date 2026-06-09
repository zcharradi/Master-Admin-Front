import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { IndustriesEffects } from "./+state/industries.effects";
import { industriesFeature } from "./+state/industries.reducer";
import { IndustriesPageComponent } from "./industries.page";

export const INDUSTRY_ROUTES: Routes = [
  {
    path: "",
    component: IndustriesPageComponent,
    providers: [provideState(industriesFeature), provideEffects([IndustriesEffects])],
  },
];