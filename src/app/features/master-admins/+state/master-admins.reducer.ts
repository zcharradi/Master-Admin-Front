import { createFeature, createReducer, on } from "@ngrx/store";

import * as MasterAdminActions from "./master-admins.actions";
import { initialMasterAdminsState, MasterAdminsState, masterAdminsAdapter } from "./master-admins.models";

export const masterAdminsFeatureKey = "masterAdmins";

export const masterAdminsFeature = createFeature({
  name: masterAdminsFeatureKey,
  reducer: createReducer(
    initialMasterAdminsState,
    on(MasterAdminActions.loadMasterAdmins, (state): MasterAdminsState => ({ ...state, loading: true, error: null })),
    on(MasterAdminActions.loadMasterAdminsSuccess, (state, { response }): MasterAdminsState =>
      masterAdminsAdapter.setAll(response.data, { ...state, loading: false, pagination: { ...state.pagination, total: response.total } })
    ),
    on(MasterAdminActions.loadMasterAdminsFailure, (state, { error }): MasterAdminsState => ({ ...state, loading: false, error })),
    on(MasterAdminActions.updateMasterAdminSuccess, (state, { admin }): MasterAdminsState =>
      masterAdminsAdapter.upsertOne(admin, { ...state, loading: false })
    )
  ),
  extraSelectors: ({ selectMasterAdminsState }) => masterAdminsAdapter.getSelectors(selectMasterAdminsState),
});
