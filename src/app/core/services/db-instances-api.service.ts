import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import { DbInstance } from "@app/features/db-instances/+state/db-instances.models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { DbInstanceService } from "@swagger/api/dbInstance.service";
import { DataSourceRequest, DataSourceResult, DbInstanceDTO, OperationResult } from "@swagger/model/models";

@Injectable({ providedIn: "root" })
export class DbInstancesApiService {
  constructor(private readonly api: DbInstanceService) {}

  list(params?: Partial<DataSourceRequest>): Observable<ApiListResponse<DbInstance>> {
    const request: DataSourceRequest = {
      page: params?.page,
      pageSize: params?.pageSize ?? 50,
      filters: params?.filters ?? null,
      sorts: params?.sorts ?? null,
    };

    return this.api.dbInstanceGetDbInstances(request).pipe(
      map((result: DataSourceResult) => {
        const data = (result?.data as DbInstanceDTO[]) ?? [];
        return {
          data: data.map((dto) => this.mapInstance(dto)),
          total: result?.total ?? data.length,
        };
      })
    );
  }

  update(id: string, payload: Partial<DbInstance>): Observable<DbInstance> {
    const dto: DbInstanceDTO = {
      id: Number(id) || undefined,
      serverName: payload.name,
      serverAddress: payload.host,
      dbName: payload.dbName,
      isActive: payload.isActive,
    };
    return this.api.dbInstanceEdit(dto).pipe(map((res) => this.pickInstanceFromOperation(res, dto)));
  }

  updateCredentials(
    id: string,
    payload: { adminPassword?: string; password?: string; readOnlyPassword?: string }
  ): Observable<void> {
    const dto: DbInstanceDTO = {
      id: Number(id) || undefined,
      adminPassword: payload.adminPassword,
      password: payload.password,
      readOnlyPassword: payload.readOnlyPassword,
    };
    return this.api.dbInstanceEdit(dto).pipe(map(() => void 0));
  }

  private pickInstanceFromOperation(res: OperationResult, fallback: DbInstanceDTO): DbInstance {
    const dto = (res?.data as DbInstanceDTO) ?? fallback;
    return this.mapInstance(dto);
  }

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
}
