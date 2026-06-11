import { createFeature, createReducer, createSelector, on } from "@ngrx/store";

import { createInitialListState, createListAdapter, ListState } from "@app/shared/state/entity-state";
import * as TenantsActions from "../actions";

// ── Models ────────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  uuid: string;
  entityName: string;
  dbInstanceId?: string;
  isActive: boolean;
  modules?: string[];
  industries?: string[];
  createdAt?: string;
}

export interface TenantFilters {
  search?: string;
  isActive?: boolean;
}

export type TenantsState = ListState<Tenant, TenantFilters>;

export const tenantsAdapter = createListAdapter<Tenant>((tenant) => tenant.id || tenant.uuid);
export const initialTenantsState: TenantsState = createInitialListState<Tenant, TenantFilters>(tenantsAdapter, {});

// ── Reducer ───────────────────────────────────────────────────────────────────

export const tenantsFeatureKey = "tenants";

export const tenantsFeature = createFeature({
  name: tenantsFeatureKey,
  reducer: createReducer(
    initialTenantsState,
    on(TenantsActions.loadTenants, (state, { filters }): TenantsState => ({
      ...state,
      loading: true,
      error: null,
      filters: filters ?? state.filters,
    })),
    on(TenantsActions.loadTenantsSuccess, (state, { response }): TenantsState =>
      tenantsAdapter.setAll(response.data, {
        ...state,
        loading: false,
        pagination: { ...state.pagination, total: response.total },
      })
    ),
    on(TenantsActions.loadTenantsFailure, (state, { error }): TenantsState => ({ ...state, loading: false, error })),
    on(TenantsActions.selectTenant, (state, { id }): TenantsState => ({ ...state, selectedId: id })),
    on(TenantsActions.setTenantFilters, (state, { filters }): TenantsState => ({ ...state, filters })),
    on(TenantsActions.createTenantSuccess, (state, { tenant }): TenantsState =>
      tenantsAdapter.addOne(tenant, { ...state, loading: false })
    ),
    on(TenantsActions.updateTenantSuccess, (state, { tenant }): TenantsState =>
      tenantsAdapter.upsertOne(tenant, { ...state, loading: false })
    ),
    on(TenantsActions.deleteTenantSuccess, (state, { id }): TenantsState =>
      tenantsAdapter.removeOne(id, { ...state, loading: false })
    )
  ),
  extraSelectors: ({ selectTenantsState }) => tenantsAdapter.getSelectors(selectTenantsState),
});

// ── Selectors ─────────────────────────────────────────────────────────────────

export const {
  selectTenantsState,
  selectLoading,
  selectError,
  selectFilters,
  selectPagination,
  selectSelectedId,
  selectAll,
  selectEntities,
} = tenantsFeature;

export const selectTenants = selectAll;
export const selectTenantEntities = selectEntities;

export const selectSelectedTenant = createSelector(
  selectEntities,
  selectSelectedId,
  (entities, id) => (id ? entities[id] ?? null : null)
);
