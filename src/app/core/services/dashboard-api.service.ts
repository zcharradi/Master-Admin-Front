import { Injectable } from "@angular/core";
import { forkJoin, map, Observable } from "rxjs";

import { DbInstanceService } from "@swagger/api/dbInstance.service";
import { ErpTenantService } from "@swagger/api/erpTenant.service";
import { ErpUserService } from "@swagger/api/erpUser.service";
import { DataSourceRequest, DataSourceResult, DbInstanceDTO, ErpTenantDTO, ErpUserDTO } from "@swagger/model/models";

export interface DashboardMetrics {
  tenantsTotal: number;
  tenantsNew: number;
  erpUsers: number;
  blockedUsers: number;
  dbInstancesActive: number;
  dbInstancesInactive: number;
  alerts: string[];
}

@Injectable({ providedIn: "root" })
export class DashboardApiService {
  constructor(
    private readonly tenantsApi: ErpTenantService,
    private readonly dbApi: DbInstanceService,
    private readonly usersApi: ErpUserService
  ) {}

  load(): Observable<DashboardMetrics> {
    const request: DataSourceRequest = { page: 1, pageSize: 500 };
    const tenants$ = this.tenantsApi.erpTenantGetAllTenants(request);
    const dbs$ = this.dbApi.dbInstanceGetDbInstances(request);
    const users$ = this.usersApi.erpUserGetUsers(request);

    return forkJoin({ tenants: tenants$, dbs: dbs$, users: users$ }).pipe(
      map(({ tenants, dbs, users }) => this.computeMetrics(tenants, dbs, users))
    );
  }

  private computeMetrics(
    tenantsResult: DataSourceResult,
    dbResult: DataSourceResult,
    usersResult: DataSourceResult
  ): DashboardMetrics {
    const tenants = (tenantsResult?.data as ErpTenantDTO[]) ?? [];
    const dbs = (dbResult?.data as DbInstanceDTO[]) ?? [];
    const users = (usersResult?.data as ErpUserDTO[]) ?? [];

    const tenantsTotal = tenantsResult?.total ?? tenants.length;
    const dbActive = dbs.filter((d) => d.isActive).length;
    const dbInactive = dbs.length - dbActive;
    const blockedUsers = users.filter((u) => u.isBlocked).length;

    const alerts: string[] = [];
    if (dbInactive > 0) alerts.push(`${dbInactive} inactive database instance(s)`);
    if (blockedUsers > 0) alerts.push(`${blockedUsers} blocked user(s)`);

    return {
      tenantsTotal,
      tenantsNew: 0,
      erpUsers: usersResult?.total ?? users.length,
      blockedUsers,
      dbInstancesActive: dbActive,
      dbInstancesInactive: dbInactive,
      alerts,
    };
  }
}
