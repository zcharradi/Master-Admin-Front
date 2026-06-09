import { createAction, props } from "@ngrx/store";
import { AuthProfile, LoginRequest, MfaVerifyRequest, TokenResponse } from "@app/core/models/auth.models";

export const login = createAction("[Auth] Login", props<{ credentials: LoginRequest }>());
export const loginSuccess = createAction("[Auth] Login Success", props<{ token: TokenResponse }>());
export const loginFailure = createAction("[Auth] Login Failure", props<{ error: string }>());
export const captchaRequired = createAction("[Auth] Captcha Required", props<{ message: string | null }>());
export const accountBlocked = createAction("[Auth] Account Blocked", props<{ message: string | null }>());

export const requireMfa = createAction("[Auth] Requires Mfa", props<{ challengeId: string }>());
export const verifyMfa = createAction("[Auth] Verify Mfa", props<{ payload: MfaVerifyRequest }>());
export const verifyMfaSuccess = createAction("[Auth] Verify Mfa Success", props<{ token: TokenResponse }>());
export const verifyMfaFailure = createAction("[Auth] Verify Mfa Failure", props<{ error: string }>());

export const loadProfile = createAction("[Auth] Load Profile");
export const loadProfileSuccess = createAction("[Auth] Load Profile Success", props<{ profile: AuthProfile }>());
export const loadProfileFailure = createAction("[Auth] Load Profile Failure", props<{ error: string }>());

export const logout = createAction("[Auth] Logout");
export const unauthorized = createAction("[Auth] Unauthorized");

export const refreshToken = createAction("[Auth] Refresh Token", props<{ refreshToken: string }>());
export const refreshTokenSuccess = createAction("[Auth] Refresh Token Success", props<{ token: TokenResponse }>());
export const refreshTokenFailure = createAction("[Auth] Refresh Token Failure");

export const setReturnUrl = createAction("[Auth] Set Return Url", props<{ returnUrl: string | null }>());
