import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { ModulesApiService } from "@app/core/services/modules-api.service";
import { UiNotificationService } from "@app/core/services/notification.service";
import * as ModulesActions from "./modules.actions";

@Injectable()
export class ModulesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: ModulesApiService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulesActions.loadModules),
      switchMap(() =>
        this.api.list().pipe(
          map((response) => ModulesActions.loadModulesSuccess({ response })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ModulesActions.loadModulesFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulesActions.updateModule),
      switchMap(({ id, changes }) =>
        this.api.update(id, changes).pipe(
          tap(() => this.notifications.success("Module updated")),
          map((module) => ModulesActions.updateModuleSuccess({ module })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ModulesActions.loadModulesFailure({ error: error.message }));
          })
        )
      )
    )
  );
}
