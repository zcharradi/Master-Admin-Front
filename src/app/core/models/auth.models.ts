export type LoginUserStatus =
  | 'success'
  | 'mfa_required'
  | 'captcha_required'
  | 'invalid_credentials'
  | 'account_blocked'
  | 'code_required'
  | 'password_reset_required'
  | 'invalid_request'
  | 'error';

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | null;
  cryptedCs?: string | null;
  requiresMfa?: boolean;
  challengeId?: string;
  loginStatus?: LoginUserStatus;
  statusMessage?: string | null;
}

export interface AuthProfile {
  id: number;
  email: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  roles?: string[];
  claims?: string[];
  hasMfa?: boolean;
  isBlocked?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface MfaVerifyRequest {
  challengeId: string;
  code: string;
}

export interface RegisterResponse {
  code: string;
  message: string;
}

export interface RegisterVerificationResponse extends RegisterResponse {
  email?: string;
}
