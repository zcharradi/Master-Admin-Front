import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { TenantsApiService } from "@app/core/services/tenants-api.service";
import * as TenantsActions from "./tenants.actions";

@Injectable()
export class TenantsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly tenantsApi: TenantsApiService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantsActions.loadTenants),
      switchMap(({ filters }) =>
        this.tenantsApi.list({ ...(filters ?? {}) }).pipe(
          map((response) => TenantsActions.loadTenantsSuccess({ response })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(TenantsActions.loadTenantsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantsActions.createTenant),
      switchMap(({ payload }) =>
        this.tenantsApi.create(payload).pipe(
          tap(() => this.notifications.success("Tenant created")),
          map((tenant) => TenantsActions.createTenantSuccess({ tenant })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(TenantsActions.loadTenantsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantsActions.updateTenant),
      switchMap(({ id, changes }) =>
        this.tenantsApi.update(id, changes).pipe(
          tap(() => this.notifications.success("Tenant updated")),
          map((tenant) => TenantsActions.updateTenantSuccess({ tenant })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(TenantsActions.loadTenantsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantsActions.deleteTenant),
      switchMap(({ id }) =>
        this.tenantsApi.remove(id).pipe(
          tap(() => this.notifications.success("Tenant disabled")),
          map(() => TenantsActions.deleteTenantSuccess({ id })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(TenantsActions.loadTenantsFailure({ error: error.message }));
          })
        )
      )
    )
  );
}
