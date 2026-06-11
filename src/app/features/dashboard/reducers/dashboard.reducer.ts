import { createFeature, createReducer, on } from "@ngrx/store";

import * as DashboardActions from "../actions";

// ── Models ────────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  tenantsTotal: number;
  tenantsNew: number;
  erpUsers: number;
  blockedUsers: number;
  dbInstancesActive: number;
  dbInstancesInactive: number;
  alerts: string[];
}

export interface DashboardState {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
}

export const initialDashboardState: DashboardState = {
  metrics: null,
  loading: false,
  error: null,
};

// ── Reducer ───────────────────────────────────────────────────────────────────

export const dashboardFeatureKey = "dashboard";

export const dashboardFeature = createFeature({
  name: dashboardFeatureKey,
  reducer: createReducer(
    initialDashboardState,
    on(DashboardActions.loadDashboard, (state): DashboardState => ({ ...state, loading: true, error: null })),
    on(DashboardActions.loadDashboardSuccess, (state, { metrics }): DashboardState => ({
      ...state,
      metrics,
      loading: false,
    })),
    on(DashboardActions.loadDashboardFailure, (state, { error }): DashboardState => ({
      ...state,
      loading: false,
      error,
    }))
  ),
});

// ── Selectors ─────────────────────────────────────────────────────────────────

export const { selectDashboardState, selectMetrics, selectLoading, selectError } = dashboardFeature;
