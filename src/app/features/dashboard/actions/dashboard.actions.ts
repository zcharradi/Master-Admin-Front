import { createAction, props } from "@ngrx/store";

import { DashboardMetrics } from "../reducers";

export const loadDashboard = createAction("[Dashboard] Load");
export const loadDashboardSuccess = createAction("[Dashboard] Load Success", props<{ metrics: DashboardMetrics }>());
export const loadDashboardFailure = createAction("[Dashboard] Load Failure", props<{ error: string }>());
