import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, forkJoin, map, of, switchMap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { ERPCountryService } from "@swagger/api/eRPCountry.service";
import { CurrencyService } from "@swagger/api/currency.service";
import { MasterErpmailTemplateService } from "@swagger/api/masterErpmailTemplate.service";
import { ErpCountryDTO, CurrencyDTO, MasterErpmailTemplateDTO } from "@swagger/model/models";
import { ReferenceData } from "../reducers";
import * as ReferencesActions from "../actions";

@Injectable()
export class ReferencesEffects {
  private readonly actions$ = inject(Actions);
  private readonly countriesApi = inject(ERPCountryService);
  private readonly currenciesApi = inject(CurrencyService);
  private readonly mailTemplatesApi = inject(MasterErpmailTemplateService);
  private readonly notifications = inject(UiNotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.loadReferences),
      switchMap(() =>
        forkJoin({
          countries: this.countriesApi.eRPCountryGetAllPost({ page: 1, pageSize: 500 }),
          currencies: this.currenciesApi.currencyGetCurrencyPost({ page: 1, pageSize: 500 }),
          mailTemplates: this.mailTemplatesApi.masterErpmailTemplateReadPost({ page: 1, pageSize: 500 }),
        }).pipe(
          map(({ countries, currencies, mailTemplates }) => {
            const data: ReferenceData = {
              countries: ((countries as any)?.data ?? countries ?? []).map((c: ErpCountryDTO) => ({
                code: c.countryCode ?? "",
                name: c.countryName ?? "",
              })),
              currencies: ((currencies as any)?.data ?? currencies ?? []).map((c: CurrencyDTO) => ({
                code: c.code ?? "",
                name: c.label ?? "",
              })),
              mailTemplates: ((mailTemplates as any)?.data ?? mailTemplates ?? []).map((t: MasterErpmailTemplateDTO) => ({
                id: String(t.id ?? ""),
                code: t.code ?? undefined,
                subject: t.subject ?? undefined,
                body: t.body ?? undefined,
              })),
            };
            return ReferencesActions.loadReferencesSuccess({ data });
          }),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ReferencesActions.loadReferencesFailure({ error: error.message }));
          })
        )
      )
    )
  );
}
