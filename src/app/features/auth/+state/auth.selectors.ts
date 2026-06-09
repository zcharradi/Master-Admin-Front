import { createSelector } from "@ngrx/store";

import { authFeature } from "./auth.reducer";

export const {
  selectAuthState,
  selectUser,
  selectToken,
  selectRefreshToken,
  selectLoading,
  selectNeedsMfa,
  selectError,
  selectReturnUrl,
  selectChallengeId,
  selectCaptchaRequired,
  selectAccountBlocked,
} = authFeature;

export const selectIsAuthenticated = createSelector(selectToken, (token) => !!token);
export const selectClaims = createSelector(selectUser, (user) => user?.claims ?? []);
export const selectHasClaim = (claim: string) => createSelector(selectClaims, (claims) => claims.includes(claim));

