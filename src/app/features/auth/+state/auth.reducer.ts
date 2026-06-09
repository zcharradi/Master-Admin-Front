import { createFeature, createReducer, on } from "@ngrx/store";

import * as AuthActions from "./auth.actions";
import { AuthState, initialAuthState, mapTokenResponse } from "./auth.models";

export const authFeatureKey = "auth";

export const authFeature = createFeature({
  name: authFeatureKey,
  reducer: createReducer(
    initialAuthState,
    on(AuthActions.login, (state): AuthState => ({ ...state, loading: true, error: null, captchaRequired: false, accountBlocked: false })),
    on(AuthActions.loginSuccess, (state, { token }): AuthState => ({
      ...state,
      ...mapTokenResponse(token),
      loading: false,
    })),
    on(AuthActions.requireMfa, (state, { challengeId }): AuthState => ({
      ...state,
      needsMfa: true,
      challengeId,
      loading: false,
    })),
    on(AuthActions.verifyMfa, (state): AuthState => ({ ...state, loading: true, error: null })),
    on(AuthActions.verifyMfaSuccess, (state, { token }): AuthState => ({
      ...state,
      ...mapTokenResponse(token),
      needsMfa: false,
      challengeId: null,
      loading: false,
    })),
    on(AuthActions.loadProfile, (state): AuthState => ({ ...state, loading: true, error: null })),
    on(AuthActions.loadProfileSuccess, (state, { profile }): AuthState => ({
      ...state,
      user: profile,
      loading: false,
      error: null,
    })),
    on(AuthActions.loadProfileFailure, (state, { error }): AuthState => ({
      ...state,
      user: null,
      loading: false,
      error,
    })),
    on(AuthActions.loginFailure, AuthActions.verifyMfaFailure, (state, { error }): AuthState => ({
      ...state,
      loading: false,
      error,
    })),
    on(AuthActions.captchaRequired, (state, { message }): AuthState => ({
      ...state,
      loading: false,
      error: message,
      captchaRequired: true,
    })),
    on(AuthActions.accountBlocked, (state, { message }): AuthState => ({
      ...state,
      loading: false,
      error: message,
      accountBlocked: true,
    })),
    on(AuthActions.refreshTokenSuccess, (state, { token }): AuthState => ({
      ...state,
      ...mapTokenResponse(token),
      loading: false,
    })),
    on(AuthActions.refreshTokenFailure, (): AuthState => ({ ...initialAuthState })),
    on(AuthActions.logout, (): AuthState => ({ ...initialAuthState })),
    on(AuthActions.setReturnUrl, (state, { returnUrl }): AuthState => ({ ...state, returnUrl })),
    on(AuthActions.unauthorized, (state): AuthState => ({ ...state, loading: false }))
  ),
});
