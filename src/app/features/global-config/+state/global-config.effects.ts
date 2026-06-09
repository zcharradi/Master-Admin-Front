import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { GlobalConfigApiService } from "@app/core/services/global-config-api.service";
import { UiNotificationService } from "@app/core/services/notification.service";
import * as GlobalConfigActions from "./global-config.actions";

@Injectable()
export class GlobalConfigEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: GlobalConfigApiService,
    private readonly notifications: UiNotificationService
  ) {}

  loadAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalConfigActions.loadAllConfigs),
      switchMap(() =>
        this.api.getAll().pipe(
          map((configs) => GlobalConfigActions.loadAllConfigsSuccess({ configs })),
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
        this.api.update(id, payload).pipe(
          tap(() => this.notifications.success("Configuration saved")),
          map((config) => GlobalConfigActions.updateGlobalConfigSuccess({ config })),
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
        this.api.updateSecret(id, payload).pipe(
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
}
