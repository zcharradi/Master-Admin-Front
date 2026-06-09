import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";

import { DashboardApiService } from "@app/core/services/dashboard-api.service";
import { UiNotificationService } from "@app/core/services/notification.service";
import * as DashboardActions from "./dashboard.actions";

@Injectable()
export class DashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly notifications = inject(UiNotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboard),
      switchMap(() =>
        this.dashboardApi.load().pipe(
          map((metrics) => DashboardActions.loadDashboardSuccess({ metrics })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(DashboardActions.loadDashboardFailure({ error: error.message }));
          })
        )
      )
    )
  );
}
