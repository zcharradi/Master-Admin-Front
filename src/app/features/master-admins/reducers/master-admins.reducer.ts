import { createFeature, createReducer, on } from "@ngrx/store";

import { createInitialListState, createListAdapter, ListState } from "@app/shared/state/entity-state";
import * as MasterAdminActions from "../actions";

// ── Models ────────────────────────────────────────────────────────────────────

export interface MasterAdmin {
  id: string;
  email: string;
  fullName?: string;
  hasMfa?: boolean;
  isBlocked?: boolean;
  roles?: string[];
}

export type MasterAdminsState = ListState<MasterAdmin>;

export const masterAdminsAdapter = createListAdapter<MasterAdmin>((admin) => admin.id);
export const initialMasterAdminsState: MasterAdminsState = {
  ...createInitialListState(masterAdminsAdapter),
};

// ── Reducer ───────────────────────────────────────────────────────────────────

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

// ── Selectors ─────────────────────────────────────────────────────────────────

export const { selectMasterAdminsState, selectLoading, selectError, selectPagination, selectAll } = masterAdminsFeature;

export const selectMasterAdmins = selectAll;
