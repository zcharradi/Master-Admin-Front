import { createFeature, createReducer, on } from "@ngrx/store";

import { createInitialListState, createListAdapter, ListState } from "@app/shared/state/entity-state";
import * as IndustriesActions from "../actions";

// ── Models ────────────────────────────────────────────────────────────────────

export interface Industry {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export type IndustriesState = ListState<Industry>;

export const industriesAdapter = createListAdapter<Industry>((i) => i.id);
export const initialIndustriesState: IndustriesState = {
  ...createInitialListState(industriesAdapter),
};

// ── Reducer ───────────────────────────────────────────────────────────────────

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

// ── Selectors ─────────────────────────────────────────────────────────────────

export const { selectIndustriesState, selectLoading, selectError, selectPagination, selectAll } = industriesFeature;

export const selectIndustries = selectAll;
