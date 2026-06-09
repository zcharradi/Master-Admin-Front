import { createFeature, createReducer, on } from "@ngrx/store";

import * as ModulesActions from "./modules.actions";
import { initialModulesState, modulesAdapter, ModulesState } from "./modules.models";

export const modulesFeatureKey = "modules";

export const modulesFeature = createFeature({
  name: modulesFeatureKey,
  reducer: createReducer(
    initialModulesState,
    on(ModulesActions.loadModules, (state): ModulesState => ({ ...state, loading: true, error: null })),
    on(ModulesActions.loadModulesSuccess, (state, { response }): ModulesState =>
      modulesAdapter.setAll(response.data, { ...state, loading: false, pagination: { ...state.pagination, total: response.total } })
    ),
    on(ModulesActions.loadModulesFailure, (state, { error }): ModulesState => ({ ...state, loading: false, error })),
    on(ModulesActions.updateModuleSuccess, (state, { module }): ModulesState => modulesAdapter.upsertOne(module, { ...state, loading: false }))
  ),
  extraSelectors: ({ selectModulesState }) => modulesAdapter.getSelectors(selectModulesState),
});
