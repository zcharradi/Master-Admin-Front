import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { IndustriesApiService } from "@app/core/services/industries-api.service";
import { UiNotificationService } from "@app/core/services/notification.service";
import * as IndustriesActions from "./industries.actions";

@Injectable()
export class IndustriesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: IndustriesApiService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IndustriesActions.loadIndustries),
      switchMap(() =>
        this.api.list().pipe(
          map((response) => IndustriesActions.loadIndustriesSuccess({ response })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(IndustriesActions.loadIndustriesFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IndustriesActions.updateIndustry),
      switchMap(({ id, changes }) =>
        this.api.update(id, changes).pipe(
          tap(() => this.notifications.success("Industry updated")),
          map((industry) => IndustriesActions.updateIndustrySuccess({ industry })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(IndustriesActions.loadIndustriesFailure({ error: error.message }));
          })
        )
      )
    )
  );
}
