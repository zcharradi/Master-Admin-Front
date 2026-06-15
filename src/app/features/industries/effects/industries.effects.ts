import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { EMPTY, catchError, map, of, switchMap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { MasterERPIndustriesService } from "@swagger/api/masterERPIndustries.service";
import { MasterERPIndustriesDTO } from "@swagger/model/models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { Industry } from "../reducers";
import * as IndustriesActions from "../actions";

@Injectable()
export class IndustriesEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(MasterERPIndustriesService);
  private readonly notifications = inject(UiNotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IndustriesActions.loadIndustries),
      switchMap(() =>
        this.api.masterERPIndustriesGetAllPost({ page: 1, pageSize: 500 }).pipe(
          map((result) => IndustriesActions.loadIndustriesSuccess({ response: this.mapList(result) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(IndustriesActions.loadIndustriesFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IndustriesActions.updateIndustry),
      switchMap(({ id, changes }) =>
        this.api.masterERPIndustriesEditPost({
          id: Number(id),
          codeIndustry: changes.code,
          labelIndustry: changes.name,
        } as MasterERPIndustriesDTO).pipe(
          map((dto: any) => IndustriesActions.updateIndustrySuccess({ industry: this.mapDto(dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return EMPTY;
          })
        )
      )
    )
  );

  private mapDto(dto: MasterERPIndustriesDTO): Industry {
    return {
      id: String(dto.id ?? ""),
      code: dto.codeIndustry ?? undefined,
      name: dto.labelIndustry ?? undefined,
      description: dto.descriptionIndustry ?? undefined,
    };
  }

  private mapList(result: any): ApiListResponse<Industry> {
    const dtos: MasterERPIndustriesDTO[] = result?.data ?? result ?? [];
    return { data: dtos.map((d) => this.mapDto(d)), total: result?.total ?? dtos.length };
  }
}
