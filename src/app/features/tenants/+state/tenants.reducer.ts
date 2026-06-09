import { createFeature, createReducer, on } from "@ngrx/store";

import * as TenantsActions from "./tenants.actions";
import { initialTenantsState, tenantsAdapter, TenantsState } from "./tenants.models";

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
