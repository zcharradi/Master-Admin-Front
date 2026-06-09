import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, map, of, switchMap, tap, withLatestFrom } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { TokenService } from "@app/core/services/token.service";
import { AuthApiService } from "@app/core/services/auth-api.service";
import { UserService } from "app/core/user/user.service";
import * as AuthActions from "./auth.actions";
import * as AuthSelectors from "./auth.selectors";

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authApi = inject(AuthApiService);
  private readonly notifications = inject(UiNotificationService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly userService = inject(UserService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authApi.login(credentials).pipe(
          map((token) => {
            if (token.requiresMfa) {
              return AuthActions.requireMfa({ challengeId: token.challengeId ?? "" });
            }
            return AuthActions.loginSuccess({ token });
          }),
          catchError((error: HttpErrorResponse) => {
            const msg =
              typeof error.error === "string"
                ? error.error
                : (error.error as any)?.message ?? "Invalid credentials. Please try again.";
            return of(AuthActions.loginFailure({ error: msg }));
          })
        )
      )
    )
  );

  verifyMfa$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyMfa),
      switchMap(({ payload }) =>
        this.authApi.verifyMfa(payload).pipe(
          map((token) => AuthActions.verifyMfaSuccess({ token })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(AuthActions.verifyMfaFailure({ error: error.message }));
          })
        )
      )
    )
  );

  persistTokens$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.verifyMfaSuccess, AuthActions.refreshTokenSuccess),
        tap(({ token }) =>
          this.tokenService.setTokens(token.accessToken, token.refreshToken ?? undefined, token.cryptedCs ?? undefined)
        )
      ),
    { dispatch: false }
  );

  loadProfileAfterAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.verifyMfaSuccess, AuthActions.refreshTokenSuccess),
      map(() => AuthActions.loadProfile())
    )
  );

  goToMfa$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.requireMfa),
        tap(() => this.router.navigate(['/auth/mfa']))
      ),
    { dispatch: false }
  );

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadProfile),
      switchMap(() => {
        const token = this.tokenService.getAccessToken();
        if (!token) {
          return of(AuthActions.loadProfileFailure({ error: "No token" }));
        }
        return this.authApi.me().pipe(
          map((profile) => AuthActions.loadProfileSuccess({ profile })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(AuthActions.loadProfileFailure({ error: error.message }));
          })
        );
      })
    )
  );

  navigateAfterProfile$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loadProfileSuccess),
        withLatestFrom(this.store.select(AuthSelectors.selectReturnUrl)),
        tap(([{ profile }, returnUrl]) => {
          const name = profile.fullName
            || `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
            || profile.email
            || 'Admin';
          this.userService.user = { id: String(profile.id), name, email: profile.email || '' };

          // Only navigate when coming from an auth page (fresh login/MFA).
          // On a browser refresh the user is already on the right route — don't override it.
          const currentUrl = this.router.url;
          const onAuthPage = !currentUrl
            || currentUrl === '/'
            || currentUrl.startsWith('/login')
            || currentUrl.startsWith('/auth');

          const target = returnUrl ?? (onAuthPage ? '/dashboard' : null);
          if (target) {
            this.router.navigateByUrl(target);
          }
          this.store.dispatch(AuthActions.setReturnUrl({ returnUrl: null }));
        })
      ),
    { dispatch: false }
  );

  refreshOnUnauthorized$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.unauthorized),
      // Refresh token lives in an HTTP-only cookie — never in localStorage/store.
      // Always attempt a refresh; the cookie is sent automatically when withCredentials is true.
      switchMap(() => of(AuthActions.refreshToken({ refreshToken: 'cookie' })))
    )
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(({ refreshToken }) =>
        this.authApi.refresh(refreshToken).pipe(
          map((token) => AuthActions.refreshTokenSuccess({ token })),
          catchError(() => of(AuthActions.refreshTokenFailure()))
        )
      )
    )
  );

  refreshTokenFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenFailure),
      map(() => AuthActions.logout())
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.tokenService.clear();
          this.userService.user = { id: '', name: 'User', email: '' };
        }),
        switchMap(() => this.authApi.logout().pipe(catchError(() => of(void 0)))),
        tap(() => this.router.navigate(["/login"]))
      ),
    { dispatch: false }
  );
}
