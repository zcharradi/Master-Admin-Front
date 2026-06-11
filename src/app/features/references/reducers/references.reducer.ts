import { createFeature, createReducer, on } from "@ngrx/store";

import * as ReferencesActions from "../actions";

// ── Models ────────────────────────────────────────────────────────────────────

export interface MailTemplate {
  id: string;
  code?: string;
  subject?: string;
  body?: string;
  language?: string;
}

export interface ReferenceData {
  countries: { code: string; name: string }[];
  currencies: { code: string; name: string; symbol?: string }[];
  mailTemplates: MailTemplate[];
}

export interface ReferencesState {
  data: ReferenceData | null;
  loading: boolean;
  error: string | null;
}

export const initialReferencesState: ReferencesState = {
  data: null,
  loading: false,
  error: null,
};

// ── Reducer ───────────────────────────────────────────────────────────────────

export const referencesFeatureKey = "references";

export const referencesFeature = createFeature({
  name: referencesFeatureKey,
  reducer: createReducer(
    initialReferencesState,
    on(ReferencesActions.loadReferences, (state): ReferencesState => ({ ...state, loading: true, error: null })),
    on(ReferencesActions.loadReferencesSuccess, (state, { data }): ReferencesState => ({
      ...state,
      data,
      loading: false,
    })),
    on(ReferencesActions.loadReferencesFailure, (state, { error }): ReferencesState => ({
      ...state,
      loading: false,
      error,
    }))
  ),
});

// ── Selectors ─────────────────────────────────────────────────────────────────

export const { selectReferencesState, selectData, selectLoading, selectError } = referencesFeature;
