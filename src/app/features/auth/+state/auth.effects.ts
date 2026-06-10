import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, map, of, switchMap, tap, throwError, withLatestFrom } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { TokenService } from "@app/core/services/token.service";
import { AuthProfile, RegisterResponse, RegisterVerificationResponse, TokenResponse } from "@app/core/models/auth.models";
import { environment } from "@environments/environment";
import { UserService } from "app/core/user/user.service";
import { AuthService } from "@swagger/api/auth.service";
import { MasterAdminUsersService } from "@swagger/api/masterAdminUsers.service";
import { LoginAdminDTO, MasterAdminUsersDTO } from "@swagger/model/models";
import * as AuthActions from "./auth.actions";
import * as AuthSelectors from "./auth.selectors";

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authApi = inject(AuthService);
  private readonly masterAdminApi = inject(MasterAdminUsersService);
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(UiNotificationService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly userService = inject(UserService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) => {
        const dto: LoginAdminDTO = { email: credentials.email, password: credentials.password };
        return this.authApi.loginAdminPost(dto).pipe(
          map((response) => {
            const token = this.mapToken(response);
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
        );
      })
    )
  );

  verifyMfa$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyMfa),
      switchMap(({ payload }) =>
        throwError(() => new Error("MFA verification not exposed in the current Swagger contract")).pipe(
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
        tap(() => this.router.navigate(["/auth/mfa"]))
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
        return this.masterAdminApi.usersCurrentGet().pipe(
          map((dto) => AuthActions.loadProfileSuccess({ profile: this.mapProfile(dto) })),
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
          const name =
            profile.fullName ||
            `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
            profile.email ||
            "Admin";
          this.userService.user = { id: String(profile.id), name, email: profile.email || "" };

          const currentUrl = this.router.url;
          const onAuthPage =
            !currentUrl ||
            currentUrl === "/" ||
            currentUrl.startsWith("/login") ||
            currentUrl.startsWith("/auth");

          const target = returnUrl ?? (onAuthPage ? "/dashboard" : null);
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
      switchMap(() => of(AuthActions.refreshToken({ refreshToken: "cookie" })))
    )
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        this.authApi.authRefreshTokenPost().pipe(
          map((response) => AuthActions.refreshTokenSuccess({ token: this.mapToken(response) })),
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
          this.userService.user = { id: "", name: "User", email: "" };
        }),
        switchMap(() => this.authApi.authSignOutPost().pipe(catchError(() => of(void 0)))),
        tap(() => this.router.navigate(["/login"]))
      ),
    { dispatch: false }
  );

  private mapToken(response: any): TokenResponse {
    const token: any = response?.token ?? response ?? {};
    const accessToken = token?.accessToken ?? token?.Access_token ?? token?.access_token ?? token?.token ?? "";
    if (!accessToken) throw new Error("Authentication token missing in the response.");
    return {
      accessToken,
      refreshToken: token?.refreshToken ?? token?.Refresh_token ?? token?.refresh_token ?? null,
      expiresIn: token?.expiresIn ?? token?.Expires_in ?? token?.expires_in ?? null,
      cryptedCs: token?.cryptedCs ?? token?.CryptedCs ?? null,
      requiresMfa: token?.requiresMfa ?? false,
      challengeId: token?.challengeId,
      loginStatus: "success",
    };
  }

  private mapProfile(dto: MasterAdminUsersDTO): AuthProfile {
    const firstName = dto?.firstName ?? "";
    const lastName = dto?.lastName ?? "";
    return {
      id: Number(dto?.id ?? 0),
      email: dto?.email ?? "",
      userName: dto?.userName ?? undefined,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim() || undefined,
      hasMfa: dto?.hasM2f ?? false,
      isBlocked: dto?.isBlocked ?? false,
      roles: [],
      claims: [],
    };
  }
}
