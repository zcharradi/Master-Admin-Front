import { createSelector } from "@ngrx/store";

import { dbInstancesFeature } from "./db-instances.reducer";

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
  createSelector(selectDbInstanceEntities, (entities) => entities[id]);

export const selectSelectedDbInstance = createSelector(
  selectDbInstanceEntities,
  selectSelectedId,
  (entities, id) => (id ? entities[id] ?? null : null)
);