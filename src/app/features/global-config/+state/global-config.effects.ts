import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { MasterErpglobalConfigService } from "@swagger/api/masterErpglobalConfig.service";
import { MasterErpglobalConfigDTO } from "@swagger/model/models";
import { GlobalConfig } from "./global-config.models";
import * as GlobalConfigActions from "./global-config.actions";

@Injectable()
export class GlobalConfigEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: MasterErpglobalConfigService,
    private readonly notifications: UiNotificationService
  ) {}

  loadAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalConfigActions.loadAllConfigs),
      switchMap(() =>
        this.api.masterErpglobalConfigsReadPost().pipe(
          map((result: any) => {
            const configs = ((result?.data ?? []) as any[]).map((dto) => this.fromDto(dto));
            return GlobalConfigActions.loadAllConfigsSuccess({ configs });
          }),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(GlobalConfigActions.loadAllConfigsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalConfigActions.updateGlobalConfig),
      switchMap(({ id, payload }) =>
        this.api.masterErpglobalConfigsGlobalConfigIdGet(id).pipe(
          switchMap((current) =>
            this.api.masterErpglobalConfigsGlobalConfigIdPut(id, this.toDto(current as any, payload))
          ),
          tap(() => this.notifications.success("Configuration saved")),
          map((config) => GlobalConfigActions.updateGlobalConfigSuccess({ config: this.fromDto(config as any) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(GlobalConfigActions.updateGlobalConfigFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateSecret$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalConfigActions.updateGlobalSecret),
      switchMap(({ id, payload }) =>
        this.api.masterErpglobalConfigsGlobalConfigIdGet(id).pipe(
          switchMap((current) =>
            this.api.masterErpglobalConfigsGlobalConfigIdPut(id, this.toDto(current as any, payload))
          ),
          tap(() => this.notifications.success("Secrets updated")),
          map(() => GlobalConfigActions.updateGlobalSecretSuccess()),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(GlobalConfigActions.updateGlobalConfigFailure({ error: error.message }));
          })
        )
      )
    )
  );

  private fromDto(dto: any): GlobalConfig {
    return {
      id: dto.id,
      environmentName: dto.environmentName ?? undefined,
      temporaryPhysicalPath: dto.temporaryPhysicalPath ?? undefined,
      virtualDirectoryName: dto.virtualDirectoryName ?? undefined,
      zipLibraryPath: dto.zipLibraryPath ?? undefined,
      executionDnsDomain: dto.executionDnsDomain ?? undefined,
      signatureFile: dto.signatureFile ?? undefined,
      requirePasswordComplexity: dto.requirePasswordComplexity ?? false,
      minPasswordLength: dto.minPasswordLength ?? 8,
      requireUpperCase: dto.requireUpperCase ?? false,
      requireLowerCase: dto.requireLowerCase ?? false,
      requireDigits: dto.requireDigits ?? false,
      requireSpecialCharacters: dto.requireSpecialCharacters ?? false,
      hasResetPasswordEveryXdays: dto.hasResetPasswordEveryXdays ?? false,
      resetPasswordEveryXdays: dto.resetPasswordEveryXdays ?? 0,
      hasM2f: dto.hasM2f ?? false,
      m2falwaysAsk: dto.m2falwaysAsk ?? false,
      m2ffrequencyXdays: dto.m2ffrequencyXdays ?? 0,
      m2fuserCanControl: dto.m2fuserCanControl ?? false,
      m2factiveTime: dto.m2factiveTime ?? 0,
      m2fnumberOfTries: dto.m2fnumberOfTries ?? 3,
      numberOfRegenerateCode: dto.numberOfRegenerateCode ?? 3,
      accessTokenExpiration: dto.accessTokenExpiration ?? 60,
      refreshTokenExpiration: dto.refreshTokenExpiration ?? 1440,
      hasCaptcha: dto.hasCaptcha ?? false,
      showCaptchaLoginAfterX: dto.showCaptchaLoginAfterX ?? 3,
      hasBlockAccount: dto.hasBlockAccount ?? false,
      blockAccountAfterX: dto.blockAccountAfterX ?? 5,
      globalSmtpAccount: dto.globalSmtpAccount ?? undefined,
      globalSmtpUser: dto.globalSmtpUser ?? undefined,
      globalSmtpPort: dto.globalSmtpPort,
      frontDirectoryPath: dto.frontDirectoryPath ?? undefined,
      globalDfsUserId: dto.globalDfsUserId ?? undefined,
      globalDfsUserName: dto.globalDfsUserName ?? undefined,
    };
  }

  private toDto(current: any, p: Partial<GlobalConfig>): MasterErpglobalConfigDTO {
    return {
      ...current,
      environmentName: p.environmentName ?? current.environmentName,
      temporaryPhysicalPath: p.temporaryPhysicalPath ?? current.temporaryPhysicalPath,
      virtualDirectoryName: p.virtualDirectoryName ?? current.virtualDirectoryName,
      zipLibraryPath: p.zipLibraryPath ?? current.zipLibraryPath,
      requirePasswordComplexity: p.requirePasswordComplexity ?? current.requirePasswordComplexity,
      minPasswordLength: p.minPasswordLength ?? current.minPasswordLength,
      requireUpperCase: p.requireUpperCase ?? current.requireUpperCase,
      requireLowerCase: p.requireLowerCase ?? current.requireLowerCase,
      requireDigits: p.requireDigits ?? current.requireDigits,
      requireSpecialCharacters: p.requireSpecialCharacters ?? current.requireSpecialCharacters,
      hasResetPasswordEveryXdays: p.hasResetPasswordEveryXdays ?? current.hasResetPasswordEveryXdays,
      resetPasswordEveryXdays: p.resetPasswordEveryXdays ?? current.resetPasswordEveryXdays,
      hasM2f: p.hasM2f ?? current.hasM2f,
      m2falwaysAsk: p.m2falwaysAsk ?? current.m2falwaysAsk,
      m2ffrequencyXdays: p.m2ffrequencyXdays ?? current.m2ffrequencyXdays,
      m2fuserCanControl: p.m2fuserCanControl ?? current.m2fuserCanControl,
      m2factiveTime: p.m2factiveTime ?? current.m2factiveTime,
      m2fnumberOfTries: p.m2fnumberOfTries ?? current.m2fnumberOfTries,
      numberOfRegenerateCode: p.numberOfRegenerateCode ?? current.numberOfRegenerateCode,
      accessTokenExpiration: p.accessTokenExpiration ?? current.accessTokenExpiration,
      hasCaptcha: p.hasCaptcha ?? current.hasCaptcha,
      showCaptchaLoginAfterX: p.showCaptchaLoginAfterX ?? current.showCaptchaLoginAfterX,
      globalSmtpAccount: p.globalSmtpAccount ?? current.globalSmtpAccount,
      globalSmtpUser: p.globalSmtpUser ?? current.globalSmtpUser,
      globalSmtpPort: p.globalSmtpPort ?? current.globalSmtpPort,
      frontDirectoryPath: p.frontDirectoryPath ?? current.frontDirectoryPath,
      globalDfsUserId: p.globalDfsUserId ?? current.globalDfsUserId,
      globalDfsUserName: p.globalDfsUserName ?? current.globalDfsUserName,
      globalSmtpPasswordHash: p.globalSmtpPasswordHash ?? current.globalSmtpPasswordHash,
      globalDfsUserPassword: p.globalDfsUserPassword ?? current.globalDfsUserPassword,
    };
  }
}
