import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { ErpUserService } from "@swagger/api/erpUser.service";
import { DataSourceRequest, ErpUserDTO } from "@swagger/model/models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { ErpUser } from "./erp-users.models";
import * as ErpUserActions from "./erp-users.actions";

@Injectable()
export class ErpUsersEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: ErpUserService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ErpUserActions.loadErpUsers),
      switchMap(() => {
        const request: DataSourceRequest = { page: 1, pageSize: 50, filters: null, sorts: null };
        return this.api.erpUserGetAllPost(request).pipe(
          map((result: any) => ErpUserActions.loadErpUsersSuccess({ response: this.mapList(result) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ErpUserActions.loadErpUsersFailure({ error: error.message }));
          })
        );
      })
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ErpUserActions.updateErpUser),
      switchMap(({ id, changes }) => {
        const dto: ErpUserDTO = {
          id: Number(id) || undefined,
          email: changes.email,
          userName: changes.email,
          isActive: changes.isActive,
          isBlocked: changes.isBlocked,
          resetPasswordIsNeeded: changes.resetPasswordIsNeeded,
        };
        return this.api.erpUserEditPost(dto).pipe(
          tap(() => this.notifications.success("User updated")),
          map((res: any) => ErpUserActions.updateErpUserSuccess({ user: this.mapFromResult(res, dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ErpUserActions.loadErpUsersFailure({ error: error.message }));
          })
        );
      })
    )
  );

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

  private mapList(result: any): ApiListResponse<ErpUser> {
    const data = (result?.data as ErpUserDTO[]) ?? [];
    return { data: data.map((dto) => this.mapUser(dto)), total: result?.total ?? data.length };
  }

  private mapFromResult(res: any, fallback: ErpUserDTO): ErpUser {
    return this.mapUser((res?.data as ErpUserDTO) ?? fallback);
  }
}
