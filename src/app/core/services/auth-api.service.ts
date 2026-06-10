import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, throwError } from "rxjs";

import {
  AuthProfile,
  LoginRequest,
  MfaVerifyRequest,
  RegisterResponse,
  RegisterVerificationResponse,
  TokenResponse,
} from "@app/core/models/auth.models";
import { environment } from "@environments/environment";
import { TokenService } from "@app/core/services/token.service";
import { AuthService } from "@swagger/api/auth.service";
import { MasterAdminUsersService } from "@swagger/api/masterAdminUsers.service";
import { LoginAdminDTO, MasterAdminUsersDTO } from "@swagger/model/models";

type LoginAdminResponse = { token?: any } | any;

@Injectable({ providedIn: "root" })
export class AuthApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly authApi: AuthService,
    private readonly masterAdminApi: MasterAdminUsersService,
    private readonly tokens: TokenService
  ) {}

  login(payload: LoginRequest): Observable<TokenResponse> {
    const request: LoginAdminDTO = { email: payload.email, password: payload.password };
    return this.authApi.loginAdminPost(request).pipe(map((response) => this.mapToken(response)));
  }

  verifyMfa(_payload: MfaVerifyRequest): Observable<TokenResponse> {
    return throwError(() => new Error("MFA verification not exposed in the current Swagger contract"));
  }

  me(): Observable<AuthProfile> {
    return this.masterAdminApi.usersCurrentGet().pipe(map((dto) => this.mapProfile(dto)));
  }

  refresh(_refreshToken: string): Observable<TokenResponse> {
    return this.authApi.authRefreshTokenPost().pipe(map((response) => this.mapToken(response)));
  }

  logout(): Observable<void> {
    return this.authApi.authSignOutPost().pipe(map(() => void 0));
  }

  requestRegister(email: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.apiBaseUrl}/api/auth/register/request`, { email });
  }

  verifyRegisterToken(token: string): Observable<RegisterVerificationResponse> {
    const params = new HttpParams().set("email", token);
    return this.http.get<RegisterVerificationResponse>(`${environment.apiBaseUrl}/api/auth/register/verify`, {
      params,
    });
  }

  private mapToken(response: LoginAdminResponse): TokenResponse {
    const token: any = (response as any)?.token ?? response ?? {};
    const accessToken = token?.accessToken ?? token?.Access_token ?? token?.access_token ?? token?.token ?? "";

    if (!accessToken) {
      throw new Error("Authentication token missing in the response.");
    }

    return {
      accessToken,
      refreshToken: token?.refreshToken ?? token?.Refresh_token ?? token?.refresh_token ?? null,
      expiresIn: token?.expiresIn ?? token?.Expires_in ?? (token as any)?.expires_in ?? null,
      cryptedCs: token?.cryptedCs ?? token?.CryptedCs ?? null,
      requiresMfa: token?.requiresMfa ?? false,
      challengeId: token?.challengeId,
      loginStatus: "success",
    };
  }

  private mapProfile(dto: MasterAdminUsersDTO): AuthProfile {
    const id = Number(dto?.id ?? 0);
    const firstName = dto?.firstName ?? "";
    const lastName = dto?.lastName ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    return {
      id,
      email: dto?.email ?? "",
      userName: dto?.userName ?? undefined,
      firstName,
      lastName,
      fullName: fullName || undefined,
      hasMfa: dto?.hasM2f ?? false,
      isBlocked: dto?.isBlocked ?? false,
      roles: [],
      claims: [],
    };
  }
}
