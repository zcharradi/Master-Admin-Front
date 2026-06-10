import { Injectable } from "@angular/core";
import { map, Observable, throwError } from "rxjs";

import { MasterAdmin } from "@app/features/master-admins/+state/master-admins.models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { MasterAdminUsersService } from "@swagger/api/masterAdminUsers.service";
import { MasterAdminUsersDTO } from "@swagger/model/models";

@Injectable({ providedIn: "root" })
export class MasterAdminsApiService {
  constructor(private readonly api: MasterAdminUsersService) {}

  list(): Observable<ApiListResponse<MasterAdmin>> {
    // Swagger only exposes "current" and "by id" endpoints.
    return this.api.usersCurrentGet().pipe(
      map((dto) => ({
        data: [this.mapAdmin(dto)],
        total: 1,
      }))
    );
  }

  update(_id: string, _payload: Partial<MasterAdmin>): Observable<MasterAdmin> {
    return throwError(() => new Error("Master admin update is not exposed in the current Swagger contract"));
  }

  private mapAdmin(dto: MasterAdminUsersDTO): MasterAdmin {
    const fullName = `${dto.firstName ?? ""} ${dto.lastName ?? ""}`.trim();
    return {
      id: String(dto.id ?? crypto.randomUUID()),
      email: dto.email ?? "",
      fullName: fullName || dto.userName || "",
      hasMfa: dto.hasM2f ?? false,
      isBlocked: dto.isBlocked ?? false,
    };
  }
}
