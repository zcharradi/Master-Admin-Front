import { AsyncPipe } from "@angular/common";
import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { GridModule } from "@progress/kendo-angular-grid";

import { PageHeaderComponent } from "@app/shared/components/page-header.component";
import { GlobalConfig } from "./reducers";
import * as GlobalConfigActions from "./actions";
import * as GlobalConfigSelectors from "./reducers";

@Component({
  selector: "app-global-config-page",
  standalone: true,
  imports: [AsyncPipe, PageHeaderComponent, InputsModule, ButtonsModule, ReactiveFormsModule, GridModule],
  templateUrl: './global-config.page.html',
  styleUrls: ['./global-config.page.scss'],
})
export class GlobalConfigPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly configs$ = this.store.select(GlobalConfigSelectors.selectConfigs);
  protected readonly selectedConfig$ = this.store.select(GlobalConfigSelectors.selectSelectedConfig);
  protected readonly selectedId$ = this.store.select(GlobalConfigSelectors.selectSelectedId);
  protected readonly loading$ = this.store.select(GlobalConfigSelectors.selectLoading);
  protected readonly saving$ = this.store.select(GlobalConfigSelectors.selectSaving);
  protected readonly actions = [];

  protected form = this.fb.group({
    environmentName: [""],
    temporaryPhysicalPath: [""],
    virtualDirectoryName: [""],
    zipLibraryPath: [""],
    executionDnsDomain: [""],
    signatureFile: [""],
    requirePasswordComplexity: [false],
    minPasswordLength: [8, [Validators.required, Validators.min(4), Validators.max(128)]],
    requireUpperCase: [false],
    requireLowerCase: [false],
    requireDigits: [false],
    requireSpecialCharacters: [false],
    hasResetPasswordEveryXdays: [false],
    resetPasswordEveryXdays: [0],
    hasM2f: [false],
    m2falwaysAsk: [false],
    m2ffrequencyXdays: [0],
    m2fuserCanControl: [false],
    m2factiveTime: [0],
    m2fnumberOfTries: [3, Validators.required],
    numberOfRegenerateCode: [3, Validators.required],
    accessTokenExpiration: [60, [Validators.required, Validators.min(1)]],
    refreshTokenExpiration: [1440, [Validators.required, Validators.min(1)]],
    hasCaptcha: [false],
    showCaptchaLoginAfterX: [3],
    hasBlockAccount: [false],
    blockAccountAfterX: [5],
    globalSmtpAccount: [""],
    globalSmtpUser: [""],
    globalSmtpPort: [587],
    frontDirectoryPath: [""],
    globalDfsUserId: [""],
    globalDfsUserName: [""],
  });

  protected secretForm = this.fb.group({
    globalSmtpPasswordHash: [""],
    globalDfsUserPassword: [""],
  });

  ngOnInit(): void {
    this.store.dispatch(GlobalConfigActions.loadAllConfigs());

    this.selectedConfig$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((cfg) => {
      if (!cfg) return;
      this.form.patchValue({
        environmentName: cfg.environmentName ?? "",
        temporaryPhysicalPath: cfg.temporaryPhysicalPath ?? "",
        virtualDirectoryName: cfg.virtualDirectoryName ?? "",
        zipLibraryPath: cfg.zipLibraryPath ?? "",
        executionDnsDomain: cfg.executionDnsDomain ?? "",
        signatureFile: cfg.signatureFile ?? "",
        requirePasswordComplexity: cfg.requirePasswordComplexity,
        minPasswordLength: cfg.minPasswordLength,
        requireUpperCase: cfg.requireUpperCase,
        requireLowerCase: cfg.requireLowerCase,
        requireDigits: cfg.requireDigits,
        requireSpecialCharacters: cfg.requireSpecialCharacters,
        hasResetPasswordEveryXdays: cfg.hasResetPasswordEveryXdays,
        resetPasswordEveryXdays: cfg.resetPasswordEveryXdays,
        hasM2f: cfg.hasM2f,
        m2falwaysAsk: cfg.m2falwaysAsk,
        m2ffrequencyXdays: cfg.m2ffrequencyXdays,
        m2fuserCanControl: cfg.m2fuserCanControl,
        m2factiveTime: cfg.m2factiveTime,
        m2fnumberOfTries: cfg.m2fnumberOfTries,
        numberOfRegenerateCode: cfg.numberOfRegenerateCode,
        accessTokenExpiration: cfg.accessTokenExpiration,
        refreshTokenExpiration: cfg.refreshTokenExpiration,
        hasCaptcha: cfg.hasCaptcha,
        showCaptchaLoginAfterX: cfg.showCaptchaLoginAfterX,
        hasBlockAccount: cfg.hasBlockAccount,
        blockAccountAfterX: cfg.blockAccountAfterX,
        globalSmtpAccount: cfg.globalSmtpAccount ?? "",
        globalSmtpUser: cfg.globalSmtpUser ?? "",
        globalSmtpPort: cfg.globalSmtpPort ?? 587,
        frontDirectoryPath: cfg.frontDirectoryPath ?? "",
        globalDfsUserId: cfg.globalDfsUserId ?? "",
        globalDfsUserName: cfg.globalDfsUserName ?? "",
      }, { emitEvent: false });
      this.secretForm.reset({ globalSmtpPasswordHash: "", globalDfsUserPassword: "" });
    });
  }

  selectConfig(cfg: GlobalConfig): void {
    if (cfg.id !== undefined) {
      this.store.dispatch(GlobalConfigActions.selectConfigById({ id: cfg.id }));
    }
  }

  closePanel(): void {
    this.store.dispatch(GlobalConfigActions.clearSelection());
  }

  save(cfg: GlobalConfig): void {
    if (this.form.invalid || cfg.id === undefined) return;
    const v = this.form.getRawValue();
    const payload: Partial<GlobalConfig> = {
      environmentName: v.environmentName || undefined,
      temporaryPhysicalPath: v.temporaryPhysicalPath || undefined,
      virtualDirectoryName: v.virtualDirectoryName || undefined,
      zipLibraryPath: v.zipLibraryPath || undefined,
      executionDnsDomain: v.executionDnsDomain || undefined,
      signatureFile: v.signatureFile || undefined,
      requirePasswordComplexity: !!v.requirePasswordComplexity,
      minPasswordLength: v.minPasswordLength ?? 8,
      requireUpperCase: !!v.requireUpperCase,
      requireLowerCase: !!v.requireLowerCase,
      requireDigits: !!v.requireDigits,
      requireSpecialCharacters: !!v.requireSpecialCharacters,
      hasResetPasswordEveryXdays: !!v.hasResetPasswordEveryXdays,
      resetPasswordEveryXdays: v.resetPasswordEveryXdays ?? 0,
      hasM2f: !!v.hasM2f,
      m2falwaysAsk: !!v.m2falwaysAsk,
      m2ffrequencyXdays: v.m2ffrequencyXdays ?? 0,
      m2fuserCanControl: !!v.m2fuserCanControl,
      m2factiveTime: v.m2factiveTime ?? 0,
      m2fnumberOfTries: v.m2fnumberOfTries ?? 3,
      numberOfRegenerateCode: v.numberOfRegenerateCode ?? 3,
      accessTokenExpiration: v.accessTokenExpiration ?? 60,
      refreshTokenExpiration: v.refreshTokenExpiration ?? 1440,
      hasCaptcha: !!v.hasCaptcha,
      showCaptchaLoginAfterX: v.showCaptchaLoginAfterX ?? 3,
      hasBlockAccount: !!v.hasBlockAccount,
      blockAccountAfterX: v.blockAccountAfterX ?? 5,
      globalSmtpAccount: v.globalSmtpAccount || undefined,
      globalSmtpUser: v.globalSmtpUser || undefined,
      globalSmtpPort: v.globalSmtpPort ?? undefined,
      frontDirectoryPath: v.frontDirectoryPath || undefined,
      globalDfsUserId: v.globalDfsUserId || undefined,
      globalDfsUserName: v.globalDfsUserName || undefined,
    };
    this.store.dispatch(GlobalConfigActions.updateGlobalConfig({ id: cfg.id, payload }));
  }

  saveSecret(cfg: GlobalConfig): void {
    if (cfg.id === undefined) return;
    const v = this.secretForm.getRawValue();
    if (!v.globalSmtpPasswordHash && !v.globalDfsUserPassword) return;
    this.store.dispatch(GlobalConfigActions.updateGlobalSecret({
      id: cfg.id,
      payload: {
        globalSmtpPasswordHash: v.globalSmtpPasswordHash || undefined,
        globalDfsUserPassword: v.globalDfsUserPassword || undefined,
      },
    }));
    this.secretForm.reset({ globalSmtpPasswordHash: "", globalDfsUserPassword: "" });
  }

  refresh(): void {
    this.store.dispatch(GlobalConfigActions.loadAllConfigs());
  }
}
