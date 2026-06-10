import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { MasterErpmodulesService } from "@swagger/api/masterErpmodules.service";
import { DataSourceRequest, MasterErpmodulesDTO } from "@swagger/model/models";
import { ApiListResponse } from "@app/shared/models/pagination.model";
import { ModuleCatalog } from "./modules.models";
import * as ModulesActions from "./modules.actions";

@Injectable()
export class ModulesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly api: MasterErpmodulesService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulesActions.loadModules),
      switchMap(() => {
        const request: DataSourceRequest = { page: 1, pageSize: 100 };
        return this.api.masterErpmodulesGetAllPost(request).pipe(
          map((result: any) => ModulesActions.loadModulesSuccess({ response: this.mapList(result) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ModulesActions.loadModulesFailure({ error: error.message }));
          })
        );
      })
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulesActions.updateModule),
      switchMap(({ id, changes }) => {
        const dto: MasterErpmodulesDTO = {
          id: Number(id) || undefined,
          moduleName: changes.name,
          dbprefix: changes.code,
        };
        return this.api.masterErpmodulesEditPost(dto).pipe(
          tap(() => this.notifications.success("Module updated")),
          map((res: any) => ModulesActions.updateModuleSuccess({ module: this.mapFromResult(res, dto) })),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ModulesActions.loadModulesFailure({ error: error.message }));
          })
        );
      })
    )
  );

  private mapModule(dto: MasterErpmodulesDTO): ModuleCatalog {
    return {
      id: String(dto.id ?? crypto.randomUUID()),
      code: dto.dbprefix ?? "",
      name: dto.moduleName ?? "",
      description: (dto as any).iconName ?? undefined,
      isActive: true,
      maxAgencies: undefined,
    };
  }

  private mapList(result: any): ApiListResponse<ModuleCatalog> {
    const data = (result?.data as MasterErpmodulesDTO[]) ?? [];
    return { data: data.map((dto) => this.mapModule(dto)), total: result?.total ?? data.length };
  }

  private mapFromResult(res: any, fallback: MasterErpmodulesDTO): ModuleCatalog {
    return this.mapModule((res?.data as MasterErpmodulesDTO) ?? fallback);
  }
}
