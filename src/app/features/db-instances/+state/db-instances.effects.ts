import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { DbInstancesApiService } from "@app/core/services/db-instances-api.service";
import { UiNotificationService } from "@app/core/services/notification.service";
import * as DbInstanceActions from "./db-instances.actions";

@Injectable()
export class DbInstancesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: DbInstancesApiService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbInstanceActions.loadDbInstances),
      switchMap(() =>
        this.api.list().pipe(
          map((response) => DbInstanceActions.loadDbInstancesSuccess({ response })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(DbInstanceActions.loadDbInstancesFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbInstanceActions.updateDbInstance),
      switchMap(({ id, changes }) =>
        this.api.update(id, changes).pipe(
          tap(() => this.notifications.success("Instance updated")),
          map((instance) => DbInstanceActions.updateDbInstanceSuccess({ instance })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(DbInstanceActions.loadDbInstancesFailure({ error: error.message }));
          })
        )
      )
    )
  );

  credentials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbInstanceActions.updateDbCredentials),
      switchMap(({ id, payload }) =>
        this.api.updateCredentials(id, payload).pipe(
          tap(() => this.notifications.success("Credentials updated")),
          map(() => DbInstanceActions.updateDbCredentialsSuccess({ id })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(DbInstanceActions.loadDbInstancesFailure({ error: error.message }));
          })
        )
      )
    )
  );
}
