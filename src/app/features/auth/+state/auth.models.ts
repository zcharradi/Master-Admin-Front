import { AuthProfile, TokenResponse } from "@app/core/models/auth.models";

export interface AuthState {
  user: AuthProfile | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  needsMfa: boolean;
  challengeId: string | null;
  returnUrl: string | null;
  captchaRequired: boolean;
  accountBlocked: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  needsMfa: false,
  challengeId: null,
  returnUrl: null,
  captchaRequired: false,
  accountBlocked: false,
};

export function mapTokenResponse(token: TokenResponse): Partial<AuthState> {
  return {
    token: token.accessToken,
    refreshToken: token.refreshToken ?? null,
    needsMfa: !!token.requiresMfa,
    challengeId: token.challengeId ?? null,
  };
}
