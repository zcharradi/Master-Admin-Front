import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";

import { ReferencesApiService } from "@app/core/services/references-api.service";
import { UiNotificationService } from "@app/core/services/notification.service";
import * as ReferencesActions from "./references.actions";

@Injectable()
export class ReferencesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: ReferencesApiService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.loadReferences),
      switchMap(() =>
        this.api.load().pipe(
          map((data) => ReferencesActions.loadReferencesSuccess({ data })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ReferencesActions.loadReferencesFailure({ error: error.message }));
          })
        )
      )
    )
  );
}