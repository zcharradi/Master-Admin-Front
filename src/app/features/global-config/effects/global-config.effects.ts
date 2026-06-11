import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { EMPTY, catchError, map, of, switchMap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { MasterErpglobalConfigService } from "@swagger/api/masterErpglobalConfig.service";
import { MasterErpglobalConfigDTO } from "@swagger/model/models";
import { GlobalConfig } from "../reducers";
import * as GlobalConfigActions from "../actions";

@Injectable()
export class GlobalConfigEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(MasterErpglobalConfigService);
  private readonly notifications = inject(UiNotificationService);

  loadAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalConfigActions.loadAllConfigs),
      switchMap(() =>
        this.api.masterErpglobalConfigsReadPost({} as any).pipe(
          map((result: any) => {
            const raw: MasterErpglobalConfigDTO[] = result?.data ?? result ?? [];
            return GlobalConfigActions.loadAllConfigsSuccess({ configs: raw.map((d) => this.fromDto(d)) });
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
        this.api.masterErpglobalConfigsGlobalConfigIdPut(id, this.toDto({ id, ...payload })).pipe(
          map((dto: any) => GlobalConfigActions.updateGlobalConfigSuccess({ config: this.fromDto(dto) })),
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
        this.api.masterErpglobalConfigsGlobalConfigIdPut(id, this.toDto({ id, ...payload })).pipe(
          map(() => GlobalConfigActions.updateGlobalSecretSuccess()),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return EMPTY;
          })
        )
      )
    )
  );

  private fromDto(dto: MasterErpglobalConfigDTO): GlobalConfig {
    return {
      id: dto.id,
      environmentName: dto.environmentName ?? undefined,
      temporaryPhysicalPath: dto.temporaryPhysicalPath ?? undefined,
      globalSmtpAccount: dto.globalSmtpAccount ?? undefined,
      globalSmtpUser: dto.globalSmtpUser ?? undefined,
      globalSmtpPort: dto.globalSmtpPort,
      requirePasswordComplexity: (dto as any).requirePasswordComplexity ?? false,
      minPasswordLength: (dto as any).minPasswordLength ?? 8,
      requireUpperCase: (dto as any).requireUpperCase ?? false,
      requireLowerCase: (dto as any).requireLowerCase ?? false,
      requireDigits: (dto as any).requireDigits ?? false,
      requireSpecialCharacters: (dto as any).requireSpecialCharacters ?? false,
      hasResetPasswordEveryXdays: (dto as any).hasResetPasswordEveryXdays ?? false,
      resetPasswordEveryXdays: (dto as any).resetPasswordEveryXdays ?? 0,
      hasM2f: (dto as any).hasM2f ?? false,
      m2falwaysAsk: (dto as any).m2falwaysAsk ?? false,
      m2ffrequencyXdays: (dto as any).m2ffrequencyXdays ?? 0,
      m2fuserCanControl: (dto as any).m2fuserCanControl ?? false,
      m2factiveTime: (dto as any).m2factiveTime ?? 0,
      m2fnumberOfTries: (dto as any).m2fnumberOfTries ?? 3,
      numberOfRegenerateCode: (dto as any).numberOfRegenerateCode ?? 3,
      accessTokenExpiration: (dto as any).accessTokenExpiration ?? 60,
      refreshTokenExpiration: (dto as any).refreshTokenExpiration ?? 1440,
      hasCaptcha: (dto as any).hasCaptcha ?? false,
      showCaptchaLoginAfterX: (dto as any).showCaptchaLoginAfterX ?? 3,
      hasBlockAccount: (dto as any).hasBlockAccount ?? false,
      blockAccountAfterX: (dto as any).blockAccountAfterX ?? 5,
    };
  }

  private toDto(config: Partial<GlobalConfig>): MasterErpglobalConfigDTO {
    return config as any;
  }
}
