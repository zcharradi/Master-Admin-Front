import { createFeature, createReducer, on } from "@ngrx/store";

import { createInitialListState, createListAdapter, ListState } from "@app/shared/state/entity-state";
import * as ErpUsersActions from "../actions";

// ── Models ────────────────────────────────────────────────────────────────────

export interface ErpUser {
  id: string;
  email: string;
  fullName?: string;
  isActive: boolean;
  isBlocked: boolean;
  resetPasswordIsNeeded?: boolean;
  tenantIds?: string[];
}

export type ErpUsersState = ListState<ErpUser>;

export const erpUsersAdapter = createListAdapter<ErpUser>((user) => user.id);
export const initialErpUsersState: ErpUsersState = {
  ...createInitialListState(erpUsersAdapter),
};

// ── Reducer ───────────────────────────────────────────────────────────────────

export const erpUsersFeatureKey = "erpUsers";

export const erpUsersFeature = createFeature({
  name: erpUsersFeatureKey,
  reducer: createReducer(
    initialErpUsersState,
    on(ErpUsersActions.loadErpUsers, (state): ErpUsersState => ({ ...state, loading: true, error: null })),
    on(ErpUsersActions.loadErpUsersSuccess, (state, { response }): ErpUsersState =>
      erpUsersAdapter.setAll(response.data, {
        ...state,
        loading: false,
        pagination: { ...state.pagination, total: response.total },
      })
    ),
    on(ErpUsersActions.loadErpUsersFailure, (state, { error }): ErpUsersState => ({ ...state, loading: false, error })),
    on(ErpUsersActions.updateErpUserSuccess, (state, { user }): ErpUsersState =>
      erpUsersAdapter.upsertOne(user, { ...state, loading: false })
    )
  ),
  extraSelectors: ({ selectErpUsersState }) => erpUsersAdapter.getSelectors(selectErpUsersState),
});

// ── Selectors ─────────────────────────────────────────────────────────────────

export const { selectErpUsersState, selectLoading, selectError, selectPagination, selectAll } = erpUsersFeature;

export const selectErpUsers = selectAll;
