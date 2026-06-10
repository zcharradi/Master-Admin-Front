import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, forkJoin, map, of, switchMap } from "rxjs";

import { UiNotificationService } from "@app/core/services/notification.service";
import { CurrencyService } from "@swagger/api/currency.service";
import { ERPCountryService } from "@swagger/api/eRPCountry.service";
import { MasterErpmailTemplateService } from "@swagger/api/masterErpmailTemplate.service";
import { DataSourceRequest, MasterErpmailTemplateDTO } from "@swagger/model/models";
import { MailTemplate, ReferenceData } from "./references.models";
import * as ReferencesActions from "./references.actions";

@Injectable()
export class ReferencesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly countryApi: ERPCountryService,
    private readonly currencyApi: CurrencyService,
    private readonly mailApi: MasterErpmailTemplateService,
    private readonly notifications: UiNotificationService
  ) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.loadReferences),
      switchMap(() => {
        const request: DataSourceRequest = { page: 1, pageSize: 200 };
        return forkJoin([
          this.countryApi.eRPCountryGetAllPost(request),
          this.currencyApi.currencyGetCurrencyPost(request),
          this.mailApi.masterErpmailTemplateReadPost(request),
        ]).pipe(
          map(([countriesRes, currenciesRes, templatesRes]) => {
            const data: ReferenceData = {
              countries: this.mapCountries(countriesRes),
              currencies: this.mapCurrencies(currenciesRes),
              mailTemplates: this.mapMailTemplates(templatesRes),
            };
            return ReferencesActions.loadReferencesSuccess({ data });
          }),
          catchError((error: HttpErrorResponse) => {
            this.notifications.fromHttpError(error);
            return of(ReferencesActions.loadReferencesFailure({ error: error.message }));
          })
        );
      })
    )
  );

  private mapCountries(result: any): string[] {
    return ((result?.data as any[]) ?? [])
      .map((c) => c.countryName ?? c.country_code ?? c.countryCode)
      .filter(Boolean);
  }

  private mapCurrencies(result: any): string[] {
    return ((result?.data as any[]) ?? [])
      .map((c) => c.code ?? c.label ?? c.currencyCode)
      .filter(Boolean);
  }

  private mapMailTemplates(result: any): MailTemplate[] {
    return ((result?.data as MasterErpmailTemplateDTO[]) ?? []).map((t: any) => ({
      id: String(t.id ?? crypto.randomUUID()),
      name: t.label ?? t.name ?? "",
      subject: t.subject ?? "",
    }));
  }
}
