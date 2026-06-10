import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { MasterERPIndustriesService } from "@swagger/api/masterERPIndustries.service";
import { DataSourceRequest, MasterERPIndustriesDTO } from "@swagger/model/models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { Industry } from "./industries.models";
import * as IndustriesActions from "./industries.actions";

@Injectable()
export class IndustriesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: MasterERPIndustriesService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IndustriesActions.loadIndustries),
      switchMap(() => {
        const request: DataSourceRequest = { page: 1, pageSize: 100 };
        return this.api.masterERPIndustriesGetAllPost(request).pipe(
          map((result: any) => IndustriesActions.loadIndustriesSuccess({ response: this.mapList(result) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(IndustriesActions.loadIndustriesFailure({ error: error.message }));
          })
        );
      })
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IndustriesActions.updateIndustry),
      switchMap(({ id, changes }) => {
        const dto: MasterERPIndustriesDTO = {
          id: Number(id) || undefined,
          codeIndustry: changes.code,
          labelIndustry: changes.label,
        };
        return this.api.masterERPIndustriesEditPost(dto).pipe(
          tap(() => this.notifications.success("Industry updated")),
          map((res: any) => IndustriesActions.updateIndustrySuccess({ industry: this.mapFromResult(res, dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(IndustriesActions.loadIndustriesFailure({ error: error.message }));
          })
        );
      })
    )
  );

  private mapIndustry(dto: MasterERPIndustriesDTO): Industry {
    return {
      id: String(dto.id ?? crypto.randomUUID()),
      code: dto.codeIndustry ?? "",
      label: dto.labelIndustry ?? "",
      isActive: true,
    };
  }

  private mapList(result: any): ApiListResponse<Industry> {
    const data = (result?.data as MasterERPIndustriesDTO[]) ?? [];
    return { data: data.map((dto) => this.mapIndustry(dto)), total: result?.total ?? data.length };
  }

  private mapFromResult(res: any, fallback: MasterERPIndustriesDTO): Industry {
    return this.mapIndustry((res?.data as MasterERPIndustriesDTO) ?? fallback);
  }
}
