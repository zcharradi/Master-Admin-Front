import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { EMPTY, catchError, map, of, switchMap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { DbInstanceService } from "@swagger/api/dbInstance.service";
import { DbInstanceDTO } from "@swagger/model/models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { DbInstance } from "../reducers";
import * as DbInstanceActions from "../actions";

@Injectable()
export class DbInstancesEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(DbInstanceService);
  private readonly notifications = inject(UiNotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbInstanceActions.loadDbInstances),
      switchMap(() =>
        this.api.dbInstanceGetAllPost({ page: 1, pageSize: 500 }).pipe(
          map((result) => DbInstanceActions.loadDbInstancesSuccess({ response: this.mapList(result) })),
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
        this.api.dbInstanceEditPost({ id: Number(id), isActive: changes.isActive } as DbInstanceDTO).pipe(
          map((dto: any) => DbInstanceActions.updateDbInstanceSuccess({ instance: this.mapDto(dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return EMPTY;
          })
        )
      )
    )
  );

  updateCredentials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbInstanceActions.updateDbCredentials),
      switchMap(({ id, payload }) =>
        this.api.dbInstanceEditPost({
          id: Number(id),
          adminPassword: payload.adminPassword,
          password: payload.password,
          readOnlyPassword: payload.readOnlyPassword,
        } as DbInstanceDTO).pipe(
          map(() => DbInstanceActions.updateDbCredentialsSuccess({ id })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return EMPTY;
          })
        )
      )
    )
  );

  private mapDto(dto: DbInstanceDTO): DbInstance {
    return {
      id: String(dto.id ?? ""),
      name: dto.serverName ?? "",
      host: dto.serverAddress ?? "",
      port: 0,
      dbName: dto.dbName ?? "",
      isActive: dto.isActive ?? false,
    };
  }

  private mapList(result: any): ApiListResponse<DbInstance> {
    const dtos: DbInstanceDTO[] = result?.data ?? result ?? [];
    return { data: dtos.map((d) => this.mapDto(d)), total: result?.total ?? dtos.length };
  }
}
