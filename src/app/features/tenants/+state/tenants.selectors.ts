import { createSelector } from "@ngrx/store";

import { tenantsFeature } from "./tenants.reducer";

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
  selectTenantEntities,
  selectSelectedId,
  (entities, id) => (id ? entities[id] ?? null : null)
);