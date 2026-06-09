import { createFeature, createReducer, on } from "@ngrx/store";

import * as ReferencesActions from "./references.actions";
import { initialReferencesState, ReferencesState } from "./references.models";

export const referencesFeatureKey = "references";

export const referencesFeature = createFeature({
  name: referencesFeatureKey,
  reducer: createReducer(
    initialReferencesState,
    on(ReferencesActions.loadReferences, (state): ReferencesState => ({ ...state, loading: true, error: null })),
    on(ReferencesActions.loadReferencesSuccess, (state, { data }): ReferencesState => ({ ...state, data, loading: false })),
    on(ReferencesActions.loadReferencesFailure, (state, { error }): ReferencesState => ({ ...state, loading: false, error }))
  ),
});