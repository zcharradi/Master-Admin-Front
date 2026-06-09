import { AsyncPipe } from "@angular/common";
import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Store } from "@ngrx/store";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { GridModule } from "@progress/kendo-angular-grid";

import { PageHeaderComponent } from "@app/shared/components/page-header.component";
import { GlobalConfig } from "./+state/global-config.models";
import * as GlobalConfigActions from "./+state/global-config.actions";
import * as GlobalConfigSelectors from "./+state/global-config.selectors";

@Component({
  selector: "app-global-config-page",
  standalone: true,
  imports: [AsyncPipe, PageHeaderComponent, InputsModule, ButtonsModule, ReactiveFormsModule, GridModule],
  template: `
<div class="flex flex-col gap-6">

  <app-page-header
    title="Global configurations"
    subtitle="All masterAdminGlobalConfig records — click a row to edit"
    badge="Settings"
    [actions]="actions"
  />

  <!-- ── Layout: list left, form right ─────────────────────────────── -->
  <div class="flex gap-6 min-h-0" [class.flex-col]="!(selectedConfig$ | async)">

    <!-- ── Config list ───────────────────────────────────────────────── -->
    <div [class]="(selectedConfig$ | async) ? 'w-full lg:w-2/5 flex-shrink-0' : 'w-full'">
      <div class="analytics-card p-0 overflow-hidden">

        @if (loading$ | async) {
          <div class="flex items-center gap-3 px-6 py-4 border-b" style="border-color:rgba(var(--fuse-border-rgb),.08)">
            <div class="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        }

        @if (configs$ | async; as configs) {
          <!-- Table header -->
          <div class="grid grid-cols-[60px_1fr_1fr_1fr_80px] gap-0 px-4 py-3 border-b text-[11px] font-bold uppercase tracking-wider text-secondary"
               style="border-color:rgba(var(--fuse-border-rgb),.08)">
            <span>ID</span>
            <span>Environment</span>
            <span>DNS Domain</span>
            <span>SMTP</span>
            <span class="text-right">MFA</span>
          </div>

          @if (configs.length === 0) {
            <div class="flex flex-col items-center gap-2 py-16 text-secondary">
              <p class="text-sm font-medium">No configurations found</p>
            </div>
          }

          @for (cfg of configs; track cfg.id) {
            <div
              class="grid grid-cols-[60px_1fr_1fr_1fr_80px] gap-0 px-4 py-3 border-b cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              style="border-color:rgba(var(--fuse-border-rgb),.06)"
              [class.bg-primary-50]="(selectedId$ | async) === cfg.id"
              [class.dark:bg-primary-900\/10]="(selectedId$ | async) === cfg.id"
              [class.border-l-2]="(selectedId$ | async) === cfg.id"
              [class.border-l-primary-500]="(selectedId$ | async) === cfg.id"
              (click)="selectConfig(cfg)">

              <span class="text-xs font-mono text-secondary self-center">{{ cfg.id }}</span>

              <div class="min-w-0 self-center">
                <p class="text-sm font-medium text-default truncate">{{ cfg.environmentName || '—' }}</p>
              </div>

              <div class="min-w-0 self-center">
                <p class="text-xs text-secondary truncate">{{ cfg.executionDnsDomain || '—' }}</p>
              </div>

              <div class="min-w-0 self-center">
                <p class="text-xs text-secondary truncate">{{ cfg.globalSmtpAccount || '—' }}</p>
              </div>

              <div class="flex justify-end items-center">
                @if (cfg.hasM2f) {
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">ON</span>
                } @else {
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">OFF</span>
                }
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- ── Edit panel ────────────────────────────────────────────────── -->
    @if (selectedConfig$ | async; as cfg) {
      <div class="flex-1 min-w-0">

        <!-- Panel header -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-widest text-primary-500">Edit</p>
            <h2 class="text-lg font-semibold text-default mt-0.5">
              {{ cfg.environmentName || 'Config #' + cfg.id }}
            </h2>
          </div>
          <div class="flex items-center gap-2">
            @if (saving$ | async) {
              <span class="text-xs text-secondary animate-pulse">Saving…</span>
            }
            <button kendoButton look="flat" (click)="closePanel()">Close</button>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="save(cfg)" class="space-y-4">

          <!-- Environment -->
          <div class="config-section">
            <h3 class="config-section-title mb-4">Environment</h3>
            <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div class="field-group">
                <label class="field-label">Environment name</label>
                <input kendoTextBox formControlName="environmentName" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">Temporary physical path</label>
                <input kendoTextBox formControlName="temporaryPhysicalPath" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">Virtual directory name</label>
                <input kendoTextBox formControlName="virtualDirectoryName" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">ZIP library path</label>
                <input kendoTextBox formControlName="zipLibraryPath" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">Execution DNS domain</label>
                <input kendoTextBox formControlName="executionDnsDomain" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">Signature file</label>
                <input kendoTextBox formControlName="signatureFile" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Password policy -->
          <div class="config-section">
            <h3 class="config-section-title mb-4">Password policy</h3>
            <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="requirePasswordComplexity" />
                <span class="field-label">Complexity required</span>
              </label>
              <div class="field-group">
                <label class="field-label">Minimum length</label>
                <input kendoNumericTextBox [min]="4" [max]="128" formControlName="minPasswordLength" class="w-full" />
              </div>
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="requireUpperCase" />
                <span class="field-label">Uppercase required</span>
              </label>
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="requireLowerCase" />
                <span class="field-label">Lowercase required</span>
              </label>
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="requireDigits" />
                <span class="field-label">Digits required</span>
              </label>
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="requireSpecialCharacters" />
                <span class="field-label">Special characters</span>
              </label>
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="hasResetPasswordEveryXdays" />
                <span class="field-label">Password rotation</span>
              </label>
              <div class="field-group">
                <label class="field-label">Rotation (days)</label>
                <input kendoNumericTextBox [min]="0" [max]="365" formControlName="resetPasswordEveryXdays" class="w-full" />
              </div>
            </div>
          </div>

          <!-- MFA & Tokens -->
          <div class="config-section">
            <h3 class="config-section-title mb-4">MFA &amp; Tokens</h3>
            <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="hasM2f" />
                <span class="field-label">MFA enabled</span>
              </label>
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="m2falwaysAsk" />
                <span class="field-label">Always ask</span>
              </label>
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="m2fuserCanControl" />
                <span class="field-label">User control</span>
              </label>
              <div class="field-group">
                <label class="field-label">Frequency (days)</label>
                <input kendoNumericTextBox [min]="0" formControlName="m2ffrequencyXdays" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">Active duration (min)</label>
                <input kendoNumericTextBox [min]="0" formControlName="m2factiveTime" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">Max attempts</label>
                <input kendoNumericTextBox [min]="1" [max]="10" formControlName="m2fnumberOfTries" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">Max regenerations</label>
                <input kendoNumericTextBox [min]="1" [max]="10" formControlName="numberOfRegenerateCode" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">Access token (min)</label>
                <input kendoNumericTextBox [min]="1" formControlName="accessTokenExpiration" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">Refresh token (min)</label>
                <input kendoNumericTextBox [min]="1" formControlName="refreshTokenExpiration" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Account security -->
          <div class="config-section">
            <h3 class="config-section-title mb-4">Account security</h3>
            <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="hasCaptcha" />
                <span class="field-label">CAPTCHA enabled</span>
              </label>
              <div class="field-group">
                <label class="field-label">Show CAPTCHA after X failures</label>
                <input kendoNumericTextBox [min]="1" formControlName="showCaptchaLoginAfterX" class="w-full" />
              </div>
              <label class="checkbox-field">
                <input type="checkbox" kendoCheckBox formControlName="hasBlockAccount" />
                <span class="field-label">Account blocking</span>
              </label>
              <div class="field-group">
                <label class="field-label">Block after X attempts</label>
                <input kendoNumericTextBox [min]="1" formControlName="blockAccountAfterX" class="w-full" />
              </div>
            </div>
          </div>

          <!-- SMTP & DFS -->
          <div class="config-section">
            <h3 class="config-section-title mb-4">SMTP &amp; DFS</h3>
            <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div class="field-group">
                <label class="field-label">SMTP account (host)</label>
                <input kendoTextBox formControlName="globalSmtpAccount" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">SMTP user</label>
                <input kendoTextBox formControlName="globalSmtpUser" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">SMTP port</label>
                <input kendoNumericTextBox [min]="1" [max]="65535" formControlName="globalSmtpPort" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">DFS directory path</label>
                <input kendoTextBox formControlName="frontDirectoryPath" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">DFS user ID</label>
                <input kendoTextBox formControlName="globalDfsUserId" class="w-full" />
              </div>
              <div class="field-group">
                <label class="field-label">DFS username</label>
                <input kendoTextBox formControlName="globalDfsUserName" class="w-full" />
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button kendoButton [primary]="true" type="submit" [disabled]="form.invalid || !!(saving$ | async)">
              Save configuration
            </button>
          </div>

        </form>

        <!-- Secrets -->
        <div class="config-section mt-4 border-2 border-amber-200 dark:border-amber-800/40">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="config-section-title text-amber-700 dark:text-amber-400">Secrets</h3>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Write only</span>
          </div>
          <p class="text-xs text-secondary mb-4">Leave blank to keep existing value. Passwords are never returned by the API.</p>
          <form [formGroup]="secretForm" (ngSubmit)="saveSecret(cfg)" class="grid gap-3 md:grid-cols-3">
            <div class="field-group">
              <label class="field-label">SMTP password</label>
              <input kendoTextBox type="password" formControlName="globalSmtpPasswordHash" class="w-full" placeholder="••••••••" />
            </div>
            <div class="field-group">
              <label class="field-label">DFS password</label>
              <input kendoTextBox type="password" formControlName="globalDfsUserPassword" class="w-full" placeholder="••••••••" />
            </div>
            <div class="flex items-end">
              <button kendoButton look="outline" type="submit" [disabled]="!!(saving$ | async)">
                Update secrets
              </button>
            </div>
          </form>
        </div>

      </div>
    }

  </div>

</div>
`,
  styles: [`
    .config-section {
      background-color: rgba(var(--fuse-bg-card-rgb), 1);
      border: 1px solid rgba(var(--fuse-border-rgb), 0.08);
      border-radius: 1rem;
      padding: 1.25rem 1.5rem;
    }
    .config-section-title { font-size: 0.9rem; font-weight: 600; color: rgba(var(--fuse-text-default-rgb), 1); margin: 0; }
    .field-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .field-label { font-size: 0.8125rem; font-weight: 500; color: rgba(var(--fuse-text-default-rgb), 1); }
    .checkbox-field { display: flex; align-items: center; gap: 0.625rem; cursor: pointer; padding: 0.5rem 0; }
    .checkbox-field .field-label { margin: 0; cursor: pointer; }
  `],
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
