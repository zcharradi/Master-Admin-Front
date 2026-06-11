import { createFeature, createReducer, createSelector, on } from "@ngrx/store";

import { createInitialListState, createListAdapter, ListState } from "@app/shared/state/entity-state";
import * as DbInstanceActions from "../actions";

// ── Models ────────────────────────────────────────────────────────────────────

export interface DbInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  dbName: string;
  server?: string;
  isActive: boolean;
  tenantCount?: number;
}

export type DbInstancesState = ListState<DbInstance>;

export const dbInstancesAdapter = createListAdapter<DbInstance>((instance) => instance.id);
export const initialDbInstancesState: DbInstancesState = {
  ...createInitialListState(dbInstancesAdapter),
};

// ── Reducer ───────────────────────────────────────────────────────────────────

export const dbInstancesFeatureKey = "dbInstances";

export const dbInstancesFeature = createFeature({
  name: dbInstancesFeatureKey,
  reducer: createReducer(
    initialDbInstancesState,
    on(DbInstanceActions.loadDbInstances, (state): DbInstancesState => ({ ...state, loading: true, error: null })),
    on(DbInstanceActions.loadDbInstancesSuccess, (state, { response }): DbInstancesState =>
      dbInstancesAdapter.setAll(response.data, {
        ...state,
        loading: false,
        pagination: { ...state.pagination, total: response.total },
      })
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

// ── Selectors ─────────────────────────────────────────────────────────────────

export const {
  selectDbInstancesState,
  selectLoading,
  selectError,
  selectPagination,
  selectSelectedId,
  selectAll,
  selectEntities,
} = dbInstancesFeature;

export const selectDbInstances = selectAll;
export const selectDbInstanceEntities = selectEntities;

export const selectDbInstanceById = (id: string) =>
  createSelector(selectEntities, (entities) => entities[id]);

export const selectSelectedDbInstance = createSelector(
  selectEntities,
  selectSelectedId,
  (entities, id) => (id ? entities[id] ?? null : null)
);
