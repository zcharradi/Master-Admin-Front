import { Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { map, Observable } from "rxjs";

import { LoginRequest, MfaVerifyRequest } from "@app/core/models/auth.models";
import { TokenService } from "@app/core/services/token.service";
import * as AuthActions from "./auth.actions";
import * as AuthSelectors from "./auth.selectors";

@Injectable({ providedIn: "root" })
export class AuthFacade {
  private readonly store = inject(Store);
  private readonly tokenService = inject(TokenService);

  readonly user$ = this.store.select(AuthSelectors.selectUser);
  readonly isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
  readonly loading$ = this.store.select(AuthSelectors.selectLoading);
  readonly needsMfa$ = this.store.select(AuthSelectors.selectNeedsMfa);
  readonly error$ = this.store.select(AuthSelectors.selectError);
  readonly claims$ = this.store.select(AuthSelectors.selectClaims);
  readonly challengeId$ = this.store.select(AuthSelectors.selectChallengeId);
  readonly captchaRequired$ = this.store.select(AuthSelectors.selectCaptchaRequired);
  readonly accountBlocked$ = this.store.select(AuthSelectors.selectAccountBlocked);

  login(credentials: LoginRequest): void {
    this.store.dispatch(AuthActions.login({ credentials }));
  }

  verifyMfa(payload: MfaVerifyRequest): void {
    this.store.dispatch(AuthActions.verifyMfa({ payload }));
  }

  loadProfileIfNeeded(): void {
    if (this.tokenService.getAccessToken()) {
      this.store.dispatch(AuthActions.loadProfile());
    }
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  handleUnauthorized(): void {
    this.store.dispatch(AuthActions.unauthorized());
  }

  hasClaims(claims: string[]): Observable<boolean> {
    return this.claims$.pipe(map((userClaims) => claims.every((claim) => userClaims.includes(claim))));
  }

  setReturnUrl(returnUrl: string | null): void {
    this.store.dispatch(AuthActions.setReturnUrl({ returnUrl }));
  }
}