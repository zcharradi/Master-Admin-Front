import { createFeature, createReducer, on } from "@ngrx/store";

import * as DashboardActions from "./dashboard.actions";
import { DashboardState, initialDashboardState } from "./dashboard.models";

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
