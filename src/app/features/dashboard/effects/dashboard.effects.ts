import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, forkJoin, map, of, switchMap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { DbInstanceService } from "@swagger/api/dbInstance.service";
import { ErpTenantService } from "@swagger/api/erpTenant.service";
import { ErpUserService } from "@swagger/api/erpUser.service";
import { DataSourceRequest, DbInstanceDTO, ErpTenantDTO, ErpUserDTO } from "@swagger/model/models";
import { DashboardMetrics } from "../reducers";
import * as DashboardActions from "../actions";

@Injectable()
export class DashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly tenantsApi = inject(ErpTenantService);
  private readonly dbApi = inject(DbInstanceService);
  private readonly usersApi = inject(ErpUserService);
  private readonly notifications = inject(UiNotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboard),
      switchMap(() => {
        const request: DataSourceRequest = { page: 1, pageSize: 500 };
        return forkJoin({
          tenants: this.tenantsApi.erpTenantGetAllPost(request),
          dbs: this.dbApi.dbInstanceGetAllPost(request),
          users: this.usersApi.erpUserGetAllPost(request),
        }).pipe(
          map(({ tenants, dbs, users }) =>
            DashboardActions.loadDashboardSuccess({ metrics: this.computeMetrics(tenants, dbs, users) })
          ),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(DashboardActions.loadDashboardFailure({ error: error.message }));
          })
        );
      })
    )
  );

  private computeMetrics(tenantsResult: any, dbResult: any, usersResult: any): DashboardMetrics {
    const tenants = (tenantsResult?.data as ErpTenantDTO[]) ?? [];
    const dbs = (dbResult?.data as DbInstanceDTO[]) ?? [];
    const users = (usersResult?.data as ErpUserDTO[]) ?? [];

    const dbActive = dbs.filter((d) => d.isActive).length;
    const dbInactive = dbs.length - dbActive;
    const blockedUsers = users.filter((u) => u.isBlocked).length;

    const alerts: string[] = [];
    if (dbInactive > 0) alerts.push(`${dbInactive} inactive database instance(s)`);
    if (blockedUsers > 0) alerts.push(`${blockedUsers} blocked user(s)`);

    return {
      tenantsTotal: tenantsResult?.total ?? tenants.length,
      tenantsNew: 0,
      erpUsers: usersResult?.total ?? users.length,
      blockedUsers,
      dbInstancesActive: dbActive,
      dbInstancesInactive: dbInactive,
      alerts,
    };
  }
}
