import { createFeature, createReducer, createSelector, on } from "@ngrx/store";

import * as GlobalConfigActions from "./global-config.actions";
import { GlobalConfig, GlobalConfigState, initialGlobalConfigState } from "./global-config.models";

export const globalConfigFeatureKey = "globalConfig";

export const globalConfigFeature = createFeature({
  name: globalConfigFeatureKey,
  reducer: createReducer(
    initialGlobalConfigState,

    on(GlobalConfigActions.loadAllConfigs, (state): GlobalConfigState =>
      ({ ...state, loading: true, error: null })),

    on(GlobalConfigActions.loadAllConfigsSuccess, (state, { configs }): GlobalConfigState =>
      ({ ...state, configs, loading: false })),

    on(GlobalConfigActions.loadAllConfigsFailure, (state, { error }): GlobalConfigState =>
      ({ ...state, loading: false, error })),

    on(GlobalConfigActions.selectConfigById, (state, { id }): GlobalConfigState =>
      ({ ...state, selectedId: id })),

    on(GlobalConfigActions.clearSelection, (state): GlobalConfigState =>
      ({ ...state, selectedId: null })),

    on(GlobalConfigActions.updateGlobalConfig, GlobalConfigActions.updateGlobalSecret,
      (state): GlobalConfigState => ({ ...state, saving: true })),

    on(GlobalConfigActions.updateGlobalConfigSuccess, (state, { config }): GlobalConfigState => ({
      ...state,
      saving: false,
      configs: state.configs.map((c) => (c.id === config.id ? config : c)),
    })),

    on(GlobalConfigActions.updateGlobalSecretSuccess, (state): GlobalConfigState =>
      ({ ...state, saving: false })),

    on(GlobalConfigActions.updateGlobalConfigFailure, (state, { error }): GlobalConfigState =>
      ({ ...state, saving: false, error })),
  ),
  extraSelectors: ({ selectConfigs, selectSelectedId }) => ({
    selectSelectedConfig: createSelector(
      selectConfigs,
      selectSelectedId,
      (configs: GlobalConfig[], id: number | null): GlobalConfig | null =>
        id !== null ? (configs.find((c) => c.id === id) ?? null) : null,
    ),
  }),
});
