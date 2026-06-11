import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { EMPTY, catchError, map, of, switchMap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { ErpUserService } from "@swagger/api/erpUser.service";
import { ErpUserDTO } from "@swagger/model/models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { ErpUser } from "../reducers";
import * as ErpUsersActions from "../actions";

@Injectable()
export class ErpUsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ErpUserService);
  private readonly notifications = inject(UiNotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ErpUsersActions.loadErpUsers),
      switchMap(() =>
        this.api.erpUserGetAllPost({ page: 1, pageSize: 500 }).pipe(
          map((result) => ErpUsersActions.loadErpUsersSuccess({ response: this.mapList(result) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ErpUsersActions.loadErpUsersFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ErpUsersActions.updateErpUser),
      switchMap(({ id, changes }) =>
        this.api.erpUserEditPost({
          id: Number(id),
          isActive: changes.isActive,
          isBlocked: changes.isBlocked,
        } as ErpUserDTO).pipe(
          map((dto: any) => ErpUsersActions.updateErpUserSuccess({ user: this.mapDto(dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return EMPTY;
          })
        )
      )
    )
  );

  private mapDto(dto: ErpUserDTO): ErpUser {
    const fullName = `${dto.firstName ?? ""} ${dto.lastName ?? ""}`.trim() || dto.userName || undefined;
    return {
      id: String(dto.id ?? ""),
      email: dto.email ?? "",
      fullName,
      isActive: dto.isActive ?? false,
      isBlocked: dto.isBlocked ?? false,
      resetPasswordIsNeeded: dto.resetPasswordIsNeeded,
    };
  }

  private mapList(result: any): ApiListResponse<ErpUser> {
    const dtos: ErpUserDTO[] = result?.data ?? result ?? [];
    return { data: dtos.map((d) => this.mapDto(d)), total: result?.total ?? dtos.length };
  }
}
