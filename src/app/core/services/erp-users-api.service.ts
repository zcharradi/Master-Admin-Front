import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import { ErpUser } from "@app/features/erp-users/+state/erp-users.models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { ErpUserService } from "@swagger/api/erpUser.service";
import { DataSourceRequest, ErpUserDTO } from "@swagger/model/models";

@Injectable({ providedIn: "root" })
export class ErpUsersApiService {
  constructor(private readonly api: ErpUserService) {}

  list(params?: Partial<DataSourceRequest>): Observable<ApiListResponse<ErpUser>> {
    const request: DataSourceRequest = {
      page: params?.page,
      pageSize: params?.pageSize ?? 50,
      filters: params?.filters ?? null,
      sorts: params?.sorts ?? null,
    };

    return this.api.erpUserGetAllPost(request).pipe(
      map((result: any) => {
        const data = (result?.data as ErpUserDTO[]) ?? [];
        return {
          data: data.map((dto) => this.mapUser(dto)),
          total: result?.total ?? data.length,
        };
      })
    );
  }

  update(id: string, payload: Partial<ErpUser>): Observable<ErpUser> {
    const dto: ErpUserDTO = {
      id: Number(id) || undefined,
      email: payload.email,
      userName: payload.email,
      isActive: payload.isActive,
      isBlocked: payload.isBlocked,
      resetPasswordIsNeeded: payload.resetPasswordIsNeeded,
    };
    return this.api.erpUserEditPost(dto).pipe(map((res) => this.pickUserFromOperation(res, dto)));
  }

  private pickUserFromOperation(res: any, fallback: ErpUserDTO): ErpUser {
    const dto = (res?.data as ErpUserDTO) ?? fallback;
    return this.mapUser(dto);
  }

  private mapUser(dto: ErpUserDTO): ErpUser {
    const fullName = `${dto.firstName ?? ""} ${dto.lastName ?? ""}`.trim();
    return {
      id: String(dto.id ?? crypto.randomUUID()),
      email: dto.email ?? "",
      fullName: fullName || dto.userName || undefined,
      isActive: dto.isActive ?? false,
      isBlocked: dto.isBlocked ?? false,
      resetPasswordIsNeeded: dto.resetPasswordIsNeeded ?? false,
      tenantIds: (dto.tenants ?? []).map((t) => String(t.tenantId ?? "")),
    };
  }
}
