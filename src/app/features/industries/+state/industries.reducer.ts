import { createFeature, createReducer, on } from "@ngrx/store";

import * as IndustriesActions from "./industries.actions";
import { industriesAdapter, IndustriesState, initialIndustriesState } from "./industries.models";

export const industriesFeatureKey = "industries";

export const industriesFeature = createFeature({
  name: industriesFeatureKey,
  reducer: createReducer(
    initialIndustriesState,
    on(IndustriesActions.loadIndustries, (state): IndustriesState => ({ ...state, loading: true, error: null })),
    on(IndustriesActions.loadIndustriesSuccess, (state, { response }): IndustriesState =>
      industriesAdapter.setAll(response.data, { ...state, loading: false, pagination: { ...state.pagination, total: response.total } })
    ),
    on(IndustriesActions.loadIndustriesFailure, (state, { error }): IndustriesState => ({ ...state, loading: false, error })),
    on(IndustriesActions.updateIndustrySuccess, (state, { industry }): IndustriesState =>
      industriesAdapter.upsertOne(industry, { ...state, loading: false })
    )
  ),
  extraSelectors: ({ selectIndustriesState }) => industriesAdapter.getSelectors(selectIndustriesState),
});
