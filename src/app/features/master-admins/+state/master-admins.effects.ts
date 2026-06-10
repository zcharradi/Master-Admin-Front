import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { MasterAdminUsersService } from "@swagger/api/masterAdminUsers.service";
import { MasterAdminUsersDTO } from "@swagger/model/models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { MasterAdmin } from "./master-admins.models";
import * as MasterAdminActions from "./master-admins.actions";

@Injectable()
export class MasterAdminsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: MasterAdminUsersService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MasterAdminActions.loadMasterAdmins),
      switchMap(() =>
        this.api.usersCurrentGet().pipe(
          map((dto) => MasterAdminActions.loadMasterAdminsSuccess({ response: this.wrapSingle(dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(MasterAdminActions.loadMasterAdminsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MasterAdminActions.updateMasterAdmin),
      switchMap(({ id, changes }) => {
        this.notifications.warning("Master admin update is not exposed in the current Swagger contract");
        return of(MasterAdminActions.loadMasterAdminsFailure({ error: "Not supported" }));
      })
    )
  );

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

  private wrapSingle(dto: MasterAdminUsersDTO): ApiListResponse<MasterAdmin> {
    return { data: [this.mapAdmin(dto)], total: 1 };
  }
}
