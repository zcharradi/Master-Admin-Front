import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import { ModuleCatalog } from "@app/features/modules/+state/modules.models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { MasterErpmodulesService } from "@swagger/api/masterErpmodules.service";
import { DataSourceRequest, MasterErpmodulesDTO } from "@swagger/model/models";

@Injectable({ providedIn: "root" })
export class ModulesApiService {
  constructor(private readonly api: MasterErpmodulesService) {}

  list(): Observable<ApiListResponse<ModuleCatalog>> {
    const request: DataSourceRequest = { page: 1, pageSize: 100 };
    return this.api.masterErpmodulesGetAllPost(request).pipe(
      map((result: any) => {
        const data = (result?.data as MasterErpmodulesDTO[]) ?? [];
        return {
          data: data.map((dto) => this.mapModule(dto)),
          total: result?.total ?? data.length,
        };
      })
    );
  }

  update(id: string, payload: Partial<ModuleCatalog>): Observable<ModuleCatalog> {
    const dto: MasterErpmodulesDTO = {
      id: Number(id) || undefined,
      moduleName: payload.name,
      dbprefix: payload.code,
    };
    return this.api.masterErpmodulesEditPost(dto).pipe(map((res) => this.pickModule(res, dto)));
  }

  private pickModule(res: any, fallback: MasterErpmodulesDTO): ModuleCatalog {
    const dto = (res?.data as MasterErpmodulesDTO) ?? fallback;
    return this.mapModule(dto);
  }

  private mapModule(dto: MasterErpmodulesDTO): ModuleCatalog {
    return {
      id: String(dto.id ?? crypto.randomUUID()),
      code: dto.dbprefix ?? "",
      name: dto.moduleName ?? "",
      description: dto.iconName ?? undefined,
      isActive: true,
      maxAgencies: undefined,
    };
  }
}
