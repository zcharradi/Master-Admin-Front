import { createFeature, createReducer, on } from "@ngrx/store";

import * as DbInstanceActions from "./db-instances.actions";
import { dbInstancesAdapter, DbInstancesState, initialDbInstancesState } from "./db-instances.models";

export const dbInstancesFeatureKey = "dbInstances";

export const dbInstancesFeature = createFeature({
  name: dbInstancesFeatureKey,
  reducer: createReducer(
    initialDbInstancesState,
    on(DbInstanceActions.loadDbInstances, (state): DbInstancesState => ({ ...state, loading: true, error: null })),
    on(DbInstanceActions.loadDbInstancesSuccess, (state, { response }): DbInstancesState =>
      dbInstancesAdapter.setAll(response.data, { ...state, loading: false, pagination: { ...state.pagination, total: response.total } })
    ),
    on(DbInstanceActions.loadDbInstancesFailure, (state, { error }): DbInstancesState => ({ ...state, loading: false, error })),
    on(DbInstanceActions.selectDbInstance, (state, { id }): DbInstancesState => ({ ...state, selectedId: id })),
    on(DbInstanceActions.updateDbInstanceSuccess, (state, { instance }): DbInstancesState =>
      dbInstancesAdapter.upsertOne(instance, { ...state, loading: false })
    ),
    on(DbInstanceActions.updateDbCredentialsSuccess, (state): DbInstancesState => ({ ...state, loading: false }))
  ),
  extraSelectors: ({ selectDbInstancesState }) => dbInstancesAdapter.getSelectors(selectDbInstancesState),
});
