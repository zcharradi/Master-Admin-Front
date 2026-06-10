import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import { Industry } from "@app/features/industries/+state/industries.models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { MasterERPIndustriesService } from "@swagger/api/masterERPIndustries.service";
import { DataSourceRequest, MasterERPIndustriesDTO } from "@swagger/model/models";

@Injectable({ providedIn: "root" })
export class IndustriesApiService {
  constructor(private readonly api: MasterERPIndustriesService) {}

  list(): Observable<ApiListResponse<Industry>> {
    const request: DataSourceRequest = { page: 1, pageSize: 100 };
    return this.api.masterERPIndustriesGetAllPost(request).pipe(
      map((result: any) => {
        const data = (result?.data as MasterERPIndustriesDTO[]) ?? [];
        return {
          data: data.map((dto) => this.mapIndustry(dto)),
          total: result?.total ?? data.length,
        };
      })
    );
  }

  update(id: string, payload: Partial<Industry>): Observable<Industry> {
    const dto: MasterERPIndustriesDTO = {
      id: Number(id) || undefined,
      codeIndustry: payload.code,
      labelIndustry: payload.label,
    };
    return this.api.masterERPIndustriesEditPost(dto).pipe(map((res) => this.pickIndustry(res, dto)));
  }

  private pickIndustry(res: any, fallback: MasterERPIndustriesDTO): Industry {
    const dto = (res?.data as MasterERPIndustriesDTO) ?? fallback;
    return this.mapIndustry(dto);
  }

  private mapIndustry(dto: MasterERPIndustriesDTO): Industry {
    return {
      id: String(dto.id ?? crypto.randomUUID()),
      code: dto.codeIndustry ?? "",
      label: dto.labelIndustry ?? "",
      isActive: true,
    };
  }
}
