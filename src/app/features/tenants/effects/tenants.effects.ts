import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { EMPTY, catchError, map, of, switchMap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { ErpTenantService } from "@swagger/api/erpTenant.service";
import { ErpTenantDTO } from "@swagger/model/models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { Tenant } from "../reducers";
import * as TenantsActions from "../actions";

@Injectable()
export class TenantsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ErpTenantService);
  private readonly notifications = inject(UiNotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantsActions.loadTenants),
      switchMap(() =>
        this.api.erpTenantGetAllPost({ page: 1, pageSize: 500 }).pipe(
          map((result) => TenantsActions.loadTenantsSuccess({ response: this.mapList(result) })),
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
        this.api.erpTenantCreatePost({
          tenantId: payload.uuid,
          entityName: payload.entityName,
          dbInstanceId: payload.dbInstanceId ? Number(payload.dbInstanceId) : undefined,
        } as ErpTenantDTO).pipe(
          map((dto: any) => TenantsActions.createTenantSuccess({ tenant: this.mapDto(dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return EMPTY;
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantsActions.updateTenant),
      switchMap(({ id, changes }) =>
        this.api.erpTenantEditPost({
          id: Number(id),
          entityName: changes.entityName,
          dbInstanceId: changes.dbInstanceId ? Number(changes.dbInstanceId) : undefined,
        } as ErpTenantDTO).pipe(
          map((dto: any) => TenantsActions.updateTenantSuccess({ tenant: this.mapDto(dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return EMPTY;
          })
        )
      )
    )
  );

  private mapDto(dto: ErpTenantDTO): Tenant {
    return {
      id: String(dto.id ?? ""),
      uuid: dto.tenantId ?? "",
      entityName: dto.entityName ?? "",
      dbInstanceId: dto.dbInstanceId != null ? String(dto.dbInstanceId) : undefined,
      isActive: true,
    };
  }

  private mapList(result: any): ApiListResponse<Tenant> {
    const dtos: ErpTenantDTO[] = result?.data ?? result ?? [];
    return { data: dtos.map((d) => this.mapDto(d)), total: result?.total ?? dtos.length };
  }
}
