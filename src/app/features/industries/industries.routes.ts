import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { Routes } from "@angular/router";

import { IndustriesEffects } from "./effects";
import { industriesFeature } from "./reducers";
import { IndustriesPageComponent } from "./industries.page";

export const INDUSTRY_ROUTES: Routes = [
  {
    path: "",
    component: IndustriesPageComponent,
    providers: [provideState(industriesFeature), provideEffects([IndustriesEffects])],
  },
];
