import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { ErpTenantService } from "@swagger/api/erpTenant.service";
import { DataSourceRequest, ErpTenantDTO } from "@swagger/model/models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { Tenant } from "./tenants.models";
import * as TenantsActions from "./tenants.actions";

@Injectable()
export class TenantsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: ErpTenantService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantsActions.loadTenants),
      switchMap(({ filters }) => {
        const request: DataSourceRequest = {
          page: 1,
          pageSize: 50,
          filters: null,
          sorts: null,
        };
        return this.api.erpTenantGetAllPost(request).pipe(
          map((result: any) => {
            const response = this.mapList(result);
            return TenantsActions.loadTenantsSuccess({ response });
          }),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(TenantsActions.loadTenantsFailure({ error: error.message }));
          })
        );
      })
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantsActions.createTenant),
      switchMap(({ payload }) => {
        const dto: ErpTenantDTO = {
          entityName: payload.entityName ?? payload.uuid ?? "",
          tenantId: payload.uuid,
          dbInstanceId: payload.dbInstanceId ? Number(payload.dbInstanceId) : undefined,
        };
        return this.api.erpTenantCreatePost(dto).pipe(
          tap(() => this.notifications.success("Tenant created")),
          map((res: any) => TenantsActions.createTenantSuccess({ tenant: this.mapFromResult(res, dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(TenantsActions.loadTenantsFailure({ error: error.message }));
          })
        );
      })
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantsActions.updateTenant),
      switchMap(({ id, changes }) => {
        const dto: ErpTenantDTO = {
          id: Number(id) || undefined,
          tenantId: changes.uuid ?? id,
          entityName: changes.entityName,
          dbInstanceId: changes.dbInstanceId ? Number(changes.dbInstanceId) : undefined,
        };
        return this.api.erpTenantEditPost(dto).pipe(
          tap(() => this.notifications.success("Tenant updated")),
          map((res: any) => TenantsActions.updateTenantSuccess({ tenant: this.mapFromResult(res, dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(TenantsActions.loadTenantsFailure({ error: error.message }));
          })
        );
      })
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TenantsActions.deleteTenant),
      switchMap(({ id }) =>
        this.api.erpTenantDeleteIdPost(Number(id)).pipe(
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

  private mapTenant(dto: ErpTenantDTO): Tenant {
    return {
      id: String(dto.id ?? dto.tenantId ?? crypto.randomUUID()),
      uuid: dto.tenantId ?? String(dto.id ?? ""),
      entityName: dto.entityName ?? "",
      dbInstanceId: dto.dbInstanceId ? String(dto.dbInstanceId) : undefined,
      isActive: true,
      modules: [],
      industries: [],
      createdAt: (dto as any).addNewTime ?? undefined,
    };
  }

  private mapList(result: any): ApiListResponse<Tenant> {
    const data = (result?.data as ErpTenantDTO[]) ?? [];
    return { data: data.map((dto) => this.mapTenant(dto)), total: result?.total ?? data.length };
  }

  private mapFromResult(res: any, fallback: ErpTenantDTO): Tenant {
    return this.mapTenant((res?.data as ErpTenantDTO) ?? fallback);
  }
}
