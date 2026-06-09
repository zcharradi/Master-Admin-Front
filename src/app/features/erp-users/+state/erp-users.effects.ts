import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { ErpUsersApiService } from "@app/core/services/erp-users-api.service";
import { UiNotificationService } from "@app/core/services/notification.service";
import * as ErpUserActions from "./erp-users.actions";

@Injectable()
export class ErpUsersEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: ErpUsersApiService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ErpUserActions.loadErpUsers),
      switchMap(() =>
        this.api.list().pipe(
          map((response) => ErpUserActions.loadErpUsersSuccess({ response })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ErpUserActions.loadErpUsersFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ErpUserActions.updateErpUser),
      switchMap(({ id, changes }) =>
        this.api.update(id, changes).pipe(
          tap(() => this.notifications.success("User updated")),
          map((user) => ErpUserActions.updateErpUserSuccess({ user })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ErpUserActions.loadErpUsersFailure({ error: error.message }));
          })
        )
      )
    )
  );
}
