import { globalConfigFeature } from "./global-config.reducer";

export const {
  selectGlobalConfigState,
  selectConfigs,
  selectSelectedId,
  selectSelectedConfig,
  selectLoading,
  selectSaving,
  selectError,
} = globalConfigFeature;
