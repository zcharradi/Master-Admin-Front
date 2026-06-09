import { createFeature, createReducer, on } from "@ngrx/store";

import * as ErpUserActions from "./erp-users.actions";
import { erpUsersAdapter, ErpUsersState, initialErpUsersState } from "./erp-users.models";

export const erpUsersFeatureKey = "erpUsers";

export const erpUsersFeature = createFeature({
  name: erpUsersFeatureKey,
  reducer: createReducer(
    initialErpUsersState,
    on(ErpUserActions.loadErpUsers, (state): ErpUsersState => ({ ...state, loading: true, error: null })),
    on(ErpUserActions.loadErpUsersSuccess, (state, { response }): ErpUsersState =>
      erpUsersAdapter.setAll(response.data, { ...state, loading: false, pagination: { ...state.pagination, total: response.total } })
    ),
    on(ErpUserActions.loadErpUsersFailure, (state, { error }): ErpUsersState => ({ ...state, loading: false, error })),
    on(ErpUserActions.updateErpUserSuccess, (state, { user }): ErpUsersState => erpUsersAdapter.upsertOne(user, { ...state, loading: false }))
  ),
  extraSelectors: ({ selectErpUsersState }) => erpUsersAdapter.getSelectors(selectErpUsersState),
});
