import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";

@Injectable({ providedIn: "root" })
export class TokenService {
  getAccessToken(): string | null {
    return localStorage.getItem(environment.tokenStorageKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(environment.refreshTokenStorageKey);
  }

  getCryptedCs(): string | null {
    return localStorage.getItem(environment.cryptedCsStorageKey);
  }

  setTokens(accessToken: string, refreshToken?: string | null, cryptedCs?: string | null): void {
    localStorage.setItem(environment.tokenStorageKey, accessToken);
    refreshToken
      ? localStorage.setItem(environment.refreshTokenStorageKey, refreshToken)
      : localStorage.removeItem(environment.refreshTokenStorageKey);

    cryptedCs
      ? localStorage.setItem(environment.cryptedCsStorageKey, cryptedCs)
      : localStorage.removeItem(environment.cryptedCsStorageKey);
  }

  clear(): void {
    localStorage.removeItem(environment.tokenStorageKey);
    localStorage.removeItem(environment.refreshTokenStorageKey);
    localStorage.removeItem(environment.cryptedCsStorageKey);
  }
}
