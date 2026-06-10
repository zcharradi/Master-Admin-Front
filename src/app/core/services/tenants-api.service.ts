import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";

import { Tenant } from "@app/features/tenants/+state/tenants.models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { ErpTenantService } from "@swagger/api/erpTenant.service";
import { DataSourceRequest, ErpTenantDTO } from "@swagger/model/models";

@Injectable({ providedIn: "root" })
export class TenantsApiService {
  constructor(private readonly api: ErpTenantService) {}

  list(params?: Partial<DataSourceRequest> | Record<string, unknown>): Observable<ApiListResponse<Tenant>> {
    const p = (params as Partial<DataSourceRequest>) || {};
    const request: DataSourceRequest = {
      page: typeof p.page === "number" ? p.page : undefined,
      pageSize: typeof p.pageSize === "number" ? p.pageSize : 50,
      filters: Array.isArray(p.filters) ? p.filters : null,
      sorts: Array.isArray(p.sorts) ? p.sorts : null,
    };

    return this.api.erpTenantGetAllPost(request).pipe(
      map((result: any) => {
        const data = (result?.data as ErpTenantDTO[]) ?? [];
        return {
          data: data.map((dto) => this.mapTenant(dto)),
          total: result?.total ?? data.length,
        };
      })
    );
  }

  create(payload: Partial<Tenant>): Observable<Tenant> {
    const dto: ErpTenantDTO = {
      entityName: payload.entityName ?? payload.uuid ?? "",
      tenantId: payload.uuid,
      dbInstanceId: payload.dbInstanceId ? Number(payload.dbInstanceId) : undefined,
    };
    return this.api.erpTenantCreatePost(dto).pipe(map((res) => this.pickTenantFromOperation(res, dto)));
  }

  update(id: string, payload: Partial<Tenant>): Observable<Tenant> {
    const dto: ErpTenantDTO = {
      id: Number(id) || undefined,
      tenantId: payload.uuid ?? id,
      entityName: payload.entityName,
      dbInstanceId: payload.dbInstanceId ? Number(payload.dbInstanceId) : undefined,
    };
    return this.api.erpTenantEditPost(dto).pipe(map((res) => this.pickTenantFromOperation(res, dto)));
  }

  remove(id: string): Observable<void> {
    return this.api.erpTenantDeleteIdPost(Number(id)).pipe(map(() => void 0));
  }

  private pickTenantFromOperation(res: any, fallback: ErpTenantDTO): Tenant {
    const dto = (res?.data as ErpTenantDTO) ?? fallback;
    return this.mapTenant(dto);
  }

  private mapTenant(dto: ErpTenantDTO): Tenant {
    return {
      id: String(dto.id ?? dto.tenantId ?? crypto.randomUUID()),
      uuid: dto.tenantId ?? String(dto.id ?? ""),
      entityName: dto.entityName ?? "",
      dbInstanceId: dto.dbInstanceId ? String(dto.dbInstanceId) : undefined,
      isActive: true,
      modules: [],
      industries: [],
      createdAt: dto.addNewTime ?? undefined,
    };
  }
}
