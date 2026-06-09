/** Mirrors all columns of the masterAdminGlobalConfig table */
export interface GlobalConfig {
  id?: number;

  // ── Environnement ──────────────────────────────────────────────────────
  environmentName?: string;
  temporaryPhysicalPath?: string;
  virtualDirectoryName?: string;
  zipLibraryPath?: string;
  executionDnsDomain?: string;
  signatureFile?: string;

  // ── Politique de mot de passe ──────────────────────────────────────────
  requirePasswordComplexity: boolean;
  minPasswordLength: number;
  requireUpperCase: boolean;
  requireLowerCase: boolean;
  requireDigits: boolean;
  requireSpecialCharacters: boolean;
  hasResetPasswordEveryXdays: boolean;
  resetPasswordEveryXdays: number;

  // ── MFA ────────────────────────────────────────────────────────────────
  hasM2f: boolean;
  m2falwaysAsk: boolean;
  m2ffrequencyXdays: number;
  m2fuserCanControl: boolean;
  m2factiveTime: number;
  m2fnumberOfTries: number;
  numberOfRegenerateCode: number;

  // ── Tokens ─────────────────────────────────────────────────────────────
  accessTokenExpiration: number;
  refreshTokenExpiration: number;

  // ── Sécurité compte ────────────────────────────────────────────────────
  hasCaptcha: boolean;
  showCaptchaLoginAfterX: number;
  hasBlockAccount: boolean;
  blockAccountAfterX: number;

  // ── SMTP ───────────────────────────────────────────────────────────────
  globalSmtpAccount?: string;
  globalSmtpUser?: string;
  globalSmtpPort?: number;

  // ── DFS ────────────────────────────────────────────────────────────────
  frontDirectoryPath?: string;
  globalDfsUserId?: string;
  globalDfsUserName?: string;

  // ── Secrets (write-only — never read back from API) ────────────────────
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
