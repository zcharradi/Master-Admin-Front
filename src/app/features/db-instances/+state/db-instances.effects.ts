import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { DbInstanceService } from "@swagger/api/dbInstance.service";
import { DataSourceRequest, DbInstanceDTO } from "@swagger/model/models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { DbInstance } from "./db-instances.models";
import * as DbInstanceActions from "./db-instances.actions";

@Injectable()
export class DbInstancesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: DbInstanceService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbInstanceActions.loadDbInstances),
      switchMap(() => {
        const request: DataSourceRequest = { page: 1, pageSize: 50, filters: null, sorts: null };
        return this.api.dbInstanceGetAllPost(request).pipe(
          map((result: any) => DbInstanceActions.loadDbInstancesSuccess({ response: this.mapList(result) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(DbInstanceActions.loadDbInstancesFailure({ error: error.message }));
          })
        );
      })
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbInstanceActions.updateDbInstance),
      switchMap(({ id, changes }) => {
        const dto: DbInstanceDTO = {
          id: Number(id) || undefined,
          serverName: changes.name,
          serverAddress: changes.host,
          dbName: changes.dbName,
          isActive: changes.isActive,
        };
        return this.api.dbInstanceEditPost(dto).pipe(
          tap(() => this.notifications.success("Instance updated")),
          map((res: any) => DbInstanceActions.updateDbInstanceSuccess({ instance: this.mapFromResult(res, dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(DbInstanceActions.loadDbInstancesFailure({ error: error.message }));
          })
        );
      })
    )
  );

  credentials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbInstanceActions.updateDbCredentials),
      switchMap(({ id, payload }) => {
        const dto: DbInstanceDTO = {
          id: Number(id) || undefined,
          adminPassword: payload.adminPassword,
          password: payload.password,
          readOnlyPassword: payload.readOnlyPassword,
        };
        return this.api.dbInstanceEditPost(dto).pipe(
          tap(() => this.notifications.success("Credentials updated")),
          map(() => DbInstanceActions.updateDbCredentialsSuccess({ id })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(DbInstanceActions.loadDbInstancesFailure({ error: error.message }));
          })
        );
      })
    )
  );

  private mapInstance(dto: DbInstanceDTO): DbInstance {
    return {
      id: String(dto.id ?? crypto.randomUUID()),
      name: dto.serverName ?? dto.dbName ?? "",
      host: dto.serverAddress ?? "",
      port: 0,
      dbName: dto.dbName ?? "",
      server: dto.serverName ?? undefined,
      isActive: dto.isActive ?? false,
      tenantCount: undefined,
    };
  }

  private mapList(result: any): ApiListResponse<DbInstance> {
    const data = (result?.data as DbInstanceDTO[]) ?? [];
    return { data: data.map((dto) => this.mapInstance(dto)), total: result?.total ?? data.length };
  }

  private mapFromResult(res: any, fallback: DbInstanceDTO): DbInstance {
    return this.mapInstance((res?.data as DbInstanceDTO) ?? fallback);
  }
}
