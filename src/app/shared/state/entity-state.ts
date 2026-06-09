import { EntityAdapter, EntityState, createEntityAdapter } from "@ngrx/entity";
import { Pagination, defaultPagination } from "@app/shared/models/pagination.model";

export interface ListState<T, F = Record<string, unknown>> extends EntityState<T> {
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: F;
  selectedId: string | null;
}

export function createListAdapter<T>(selectId?: (model: T) => string | number): EntityAdapter<T> {
  const idSelector = selectId ? (model: T) => String(selectId(model)) : undefined;
  return createEntityAdapter<T>({ selectId: idSelector });
}

export function createInitialListState<T, F = Record<string, unknown>>(
  adapter: EntityAdapter<T>,
  filters?: F
): ListState<T, F> {
  return adapter.getInitialState({
    loading: false,
    error: null,
    pagination: defaultPagination,
    filters: filters ?? ({} as F),
    selectedId: null,
  });
}
