import { Injectable } from "@angular/core";
import { map, Observable, switchMap } from "rxjs";

import { GlobalConfig } from "@app/features/global-config/+state/global-config.models";
import { MasterErpglobalConfigService } from "@swagger/api/masterErpglobalConfig.service";
import { MasterErpglobalConfigDTO } from "@swagger/model/models";

@Injectable({ providedIn: "root" })
export class GlobalConfigApiService {
  constructor(private readonly api: MasterErpglobalConfigService) {}

  getAll(): Observable<GlobalConfig[]> {
    return this.api.masterErpglobalConfigRead().pipe(
      map((result) =>
        ((result.data ?? []) as MasterErpglobalConfigDTO[]).map((dto) => this.fromDto(dto))
      )
    );
  }

  getById(id: number): Observable<GlobalConfig> {
    return this.api.masterErpglobalConfigGetByID(id).pipe(map((dto) => this.fromDto(dto)));
  }

  update(id: number, payload: Partial<GlobalConfig>): Observable<GlobalConfig> {
    return this.api.masterErpglobalConfigGetByID(id).pipe(
      switchMap((current) => this.api.masterErpglobalConfigEdit(id, this.toDto(current, payload))),
      map((updated) => this.fromDto(updated))
    );
  }

  updateSecret(id: number, payload: Partial<GlobalConfig>): Observable<void> {
    return this.update(id, payload).pipe(map(() => void 0));
  }

  private fromDto(dto: MasterErpglobalConfigDTO): GlobalConfig {
    return {
      id: dto.id,
      environmentName: dto.environmentName ?? undefined,
      temporaryPhysicalPath: dto.temporaryPhysicalPath ?? undefined,
      virtualDirectoryName: dto.virtualDirectoryName ?? undefined,
      zipLibraryPath: dto.zipLibraryPath ?? undefined,
      executionDnsDomain: dto.executionDnsDomain ?? undefined,
      signatureFile: dto.signatureFile ?? undefined,
      requirePasswordComplexity: dto.requirePasswordComplexity ?? false,
      minPasswordLength: dto.minPasswordLength ?? 8,
      requireUpperCase: dto.requireUpperCase ?? false,
      requireLowerCase: dto.requireLowerCase ?? false,
      requireDigits: dto.requireDigits ?? false,
      requireSpecialCharacters: dto.requireSpecialCharacters ?? false,
      hasResetPasswordEveryXdays: dto.hasResetPasswordEveryXdays ?? false,
      resetPasswordEveryXdays: dto.resetPasswordEveryXdays ?? 0,
      hasM2f: dto.hasM2f ?? false,
      m2falwaysAsk: dto.m2falwaysAsk ?? false,
      m2ffrequencyXdays: dto.m2ffrequencyXdays ?? 0,
      m2fuserCanControl: dto.m2fuserCanControl ?? false,
      m2factiveTime: dto.m2factiveTime ?? 0,
      m2fnumberOfTries: dto.m2fnumberOfTries ?? 3,
      numberOfRegenerateCode: dto.numberOfRegenerateCode ?? 3,
      accessTokenExpiration: dto.accessTokenExpiration ?? 60,
      refreshTokenExpiration: dto.refreshTokenExpiration ?? 1440,
      hasCaptcha: dto.hasCaptcha ?? false,
      showCaptchaLoginAfterX: dto.showCaptchaLoginAfterX ?? 3,
      hasBlockAccount: dto.hasBlockAccount ?? false,
      blockAccountAfterX: dto.blockAccountAfterX ?? 5,
      globalSmtpAccount: dto.globalSmtpAccount ?? undefined,
      globalSmtpUser: dto.globalSmtpUser ?? undefined,
      globalSmtpPort: dto.globalSmtpPort,
      frontDirectoryPath: dto.frontDirectoryPath ?? undefined,
      globalDfsUserId: dto.globalDfsUserId ?? undefined,
      globalDfsUserName: dto.globalDfsUserName ?? undefined,
    };
  }

  private toDto(current: MasterErpglobalConfigDTO, p: Partial<GlobalConfig>): MasterErpglobalConfigDTO {
    return {
      ...current,
      environmentName: p.environmentName ?? current.environmentName,
      temporaryPhysicalPath: p.temporaryPhysicalPath ?? current.temporaryPhysicalPath,
      virtualDirectoryName: p.virtualDirectoryName ?? current.virtualDirectoryName,
      zipLibraryPath: p.zipLibraryPath ?? current.zipLibraryPath,
      executionDnsDomain: p.executionDnsDomain ?? current.executionDnsDomain,
      signatureFile: p.signatureFile ?? current.signatureFile,
      requirePasswordComplexity: p.requirePasswordComplexity ?? current.requirePasswordComplexity,
      minPasswordLength: p.minPasswordLength ?? current.minPasswordLength,
      requireUpperCase: p.requireUpperCase ?? current.requireUpperCase,
      requireLowerCase: p.requireLowerCase ?? current.requireLowerCase,
      requireDigits: p.requireDigits ?? current.requireDigits,
      requireSpecialCharacters: p.requireSpecialCharacters ?? current.requireSpecialCharacters,
      hasResetPasswordEveryXdays: p.hasResetPasswordEveryXdays ?? current.hasResetPasswordEveryXdays,
      resetPasswordEveryXdays: p.resetPasswordEveryXdays ?? current.resetPasswordEveryXdays,
      hasM2f: p.hasM2f ?? current.hasM2f,
      m2falwaysAsk: p.m2falwaysAsk ?? current.m2falwaysAsk,
      m2ffrequencyXdays: p.m2ffrequencyXdays ?? current.m2ffrequencyXdays,
      m2fuserCanControl: p.m2fuserCanControl ?? current.m2fuserCanControl,
      m2factiveTime: p.m2factiveTime ?? current.m2factiveTime,
      m2fnumberOfTries: p.m2fnumberOfTries ?? current.m2fnumberOfTries,
      numberOfRegenerateCode: p.numberOfRegenerateCode ?? current.numberOfRegenerateCode,
      accessTokenExpiration: p.accessTokenExpiration ?? current.accessTokenExpiration,
      refreshTokenExpiration: p.refreshTokenExpiration ?? current.refreshTokenExpiration,
      hasCaptcha: p.hasCaptcha ?? current.hasCaptcha,
      showCaptchaLoginAfterX: p.showCaptchaLoginAfterX ?? current.showCaptchaLoginAfterX,
      hasBlockAccount: p.hasBlockAccount ?? current.hasBlockAccount,
      blockAccountAfterX: p.blockAccountAfterX ?? current.blockAccountAfterX,
      globalSmtpAccount: p.globalSmtpAccount ?? current.globalSmtpAccount,
      globalSmtpUser: p.globalSmtpUser ?? current.globalSmtpUser,
      globalSmtpPort: p.globalSmtpPort ?? current.globalSmtpPort,
      frontDirectoryPath: p.frontDirectoryPath ?? current.frontDirectoryPath,
      globalDfsUserId: p.globalDfsUserId ?? current.globalDfsUserId,
      globalDfsUserName: p.globalDfsUserName ?? current.globalDfsUserName,
      globalSmtpPasswordHash: p.globalSmtpPasswordHash ?? current.globalSmtpPasswordHash,
      globalDfsUserPassword: p.globalDfsUserPassword ?? current.globalDfsUserPassword,
    };
  }
}
