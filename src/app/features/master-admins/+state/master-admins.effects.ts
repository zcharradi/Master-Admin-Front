import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { MasterAdminsApiService } from "@app/core/services/master-admins-api.service";
import { UiNotificationService } from "@app/core/services/notification.service";
import * as MasterAdminActions from "./master-admins.actions";

@Injectable()
export class MasterAdminsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: MasterAdminsApiService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MasterAdminActions.loadMasterAdmins),
      switchMap(() =>
        this.api.list().pipe(
          map((response) => MasterAdminActions.loadMasterAdminsSuccess({ response })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(MasterAdminActions.loadMasterAdminsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MasterAdminActions.updateMasterAdmin),
      switchMap(({ id, changes }) =>
        this.api.update(id, changes).pipe(
          tap(() => this.notifications.success("Admin updated")),
          map((admin) => MasterAdminActions.updateMasterAdminSuccess({ admin })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(MasterAdminActions.loadMasterAdminsFailure({ error: error.message }));
          })
        )
      )
    )
  );
}
