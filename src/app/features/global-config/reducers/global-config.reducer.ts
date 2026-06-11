import { createFeature, createReducer, createSelector, on } from "@ngrx/store";

import * as GlobalConfigActions from "../actions";

// ── Models ────────────────────────────────────────────────────────────────────

export interface GlobalConfig {
  id?: number;

  environmentName?: string;
  temporaryPhysicalPath?: string;
  virtualDirectoryName?: string;
  zipLibraryPath?: string;
  executionDnsDomain?: string;
  signatureFile?: string;

  requirePasswordComplexity: boolean;
  minPasswordLength: number;
  requireUpperCase: boolean;
  requireLowerCase: boolean;
  requireDigits: boolean;
  requireSpecialCharacters: boolean;
  hasResetPasswordEveryXdays: boolean;
  resetPasswordEveryXdays: number;

  hasM2f: boolean;
  m2falwaysAsk: boolean;
  m2ffrequencyXdays: number;
  m2fuserCanControl: boolean;
  m2factiveTime: number;
  m2fnumberOfTries: number;
  numberOfRegenerateCode: number;

  accessTokenExpiration: number;
  refreshTokenExpiration: number;

  hasCaptcha: boolean;
  showCaptchaLoginAfterX: number;
  hasBlockAccount: boolean;
  blockAccountAfterX: number;

  globalSmtpAccount?: string;
  globalSmtpUser?: string;
  globalSmtpPort?: number;

  frontDirectoryPath?: string;
  globalDfsUserId?: string;
  globalDfsUserName?: string;

  globalSmtpPasswordHash?: string;
  globalDfsUserPassword?: string;
}

export interface GlobalConfigState {
  configs: GlobalConfig[];
  selectedId: number | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialGlobalConfigState: GlobalConfigState = {
  configs: [],
  selectedId: null,
  loading: false,
  saving: false,
  error: null,
};

// ── Reducer ───────────────────────────────────────────────────────────────────

export const globalConfigFeatureKey = "globalConfig";

export const globalConfigFeature = createFeature({
  name: globalConfigFeatureKey,
  reducer: createReducer(
    initialGlobalConfigState,
    on(GlobalConfigActions.loadAllConfigs, (state): GlobalConfigState => ({ ...state, loading: true, error: null })),
    on(GlobalConfigActions.loadAllConfigsSuccess, (state, { configs }): GlobalConfigState => ({ ...state, configs, loading: false })),
    on(GlobalConfigActions.loadAllConfigsFailure, (state, { error }): GlobalConfigState => ({ ...state, loading: false, error })),
    on(GlobalConfigActions.selectConfigById, (state, { id }): GlobalConfigState => ({ ...state, selectedId: id })),
    on(GlobalConfigActions.clearSelection, (state): GlobalConfigState => ({ ...state, selectedId: null })),
    on(GlobalConfigActions.updateGlobalConfig, GlobalConfigActions.updateGlobalSecret,
      (state): GlobalConfigState => ({ ...state, saving: true })
    ),
    on(GlobalConfigActions.updateGlobalConfigSuccess, (state, { config }): GlobalConfigState => ({
      ...state,
      saving: false,
      configs: state.configs.map((c) => (c.id === config.id ? config : c)),
    })),
    on(GlobalConfigActions.updateGlobalSecretSuccess, (state): GlobalConfigState => ({ ...state, saving: false })),
    on(GlobalConfigActions.updateGlobalConfigFailure, (state, { error }): GlobalConfigState => ({
      ...state,
      saving: false,
      error,
    }))
  ),
  extraSelectors: ({ selectConfigs, selectSelectedId }) => ({
    selectSelectedConfig: createSelector(
      selectConfigs,
      selectSelectedId,
      (configs: GlobalConfig[], id: number | null): GlobalConfig | null =>
        id !== null ? (configs.find((c) => c.id === id) ?? null) : null
    ),
  }),
});

// ── Selectors ─────────────────────────────────────────────────────────────────

export const {
  selectGlobalConfigState,
  selectConfigs,
  selectSelectedId,
  selectSelectedConfig,
  selectLoading,
  selectSaving,
  selectError,
} = globalConfigFeature;
