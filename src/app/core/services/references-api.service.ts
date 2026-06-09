import { Injectable } from "@angular/core";
import { forkJoin, map, Observable } from "rxjs";

import { ReferenceData, MailTemplate } from "@app/features/references/+state/references.models";
import { CurrencyService } from "@swagger/api/currency.service";
import { ERPCountryService } from "@swagger/api/eRPCountry.service";
import { MasterErpmailTemplateService } from "@swagger/api/masterErpmailTemplate.service";
import { DataSourceRequest, DataSourceResult, MasterErpmailTemplateDTO } from "@swagger/model/models";

@Injectable({ providedIn: "root" })
export class ReferencesApiService {
  constructor(
    private readonly currencyApi: CurrencyService,
    private readonly countryApi: ERPCountryService,
    private readonly mailTemplateApi: MasterErpmailTemplateService
  ) {}

  load(): Observable<ReferenceData> {
    const request: DataSourceRequest = { page: 1, pageSize: 200 };

    const countries$ = this.countryApi.eRPCountryGetCountries(request);
    const currencies$ = this.currencyApi.currencyRead(request);
    const templates$ = this.mailTemplateApi.masterErpmailTemplateRead(request);

    return forkJoin([countries$, currencies$, templates$]).pipe(
      map(([countriesRes, currenciesRes, templatesRes]) => ({
        countries: this.mapCountries(countriesRes),
        currencies: this.mapCurrencies(currenciesRes),
        mailTemplates: this.mapMailTemplates(templatesRes),
      }))
    );
  }

  private mapCountries(result: DataSourceResult): string[] {
    const items = (result?.data as any[]) ?? [];
    return items.map((c) => c.countryName ?? c.country_code ?? c.countryCode).filter(Boolean);
  }

  private mapCurrencies(result: DataSourceResult): string[] {
    const items = (result?.data as any[]) ?? [];
    return items.map((c) => c.code ?? c.label ?? c.currencyCode).filter(Boolean);
  }

  private mapMailTemplates(result: DataSourceResult): MailTemplate[] {
    const items = (result?.data as MasterErpmailTemplateDTO[]) ?? [];
    return items.map((t) => ({
      id: String((t as any).id ?? crypto.randomUUID()),
      name: (t as any).label ?? (t as any).name ?? "",
      subject: (t as any).subject ?? "",
    }));
  }
}
