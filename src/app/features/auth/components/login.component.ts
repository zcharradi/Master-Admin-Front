import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { Observable, Subscription } from "rxjs";

import { AuthFacade } from "@app/features/auth/+state/auth.facade";
import { environment } from "@environments/environment";

@Component({
  selector: "app-login-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonsModule, InputsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)] p-6">
      <div class="w-full max-w-xl rounded-3xl card-surface p-8 shadow-card">
        <p class="text-xs uppercase tracking-[0.4em] text-lagoon mb-3">Master Admin</p>
        <h1 class="text-2xl font-semibold text-theme-primary mb-1">Secure sign-in</h1>
        <p class="text-sm text-theme-muted mb-6">Bearer token + MFA based on configuration.</p>

        <div *ngIf="accountBlocked$ | async" class="mb-4 p-3 rounded-lg bg-rose-100 border border-rose-300 text-rose-700 text-sm">
          Account blocked. Contact an administrator.
        </div>

        <form class="space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
          <label class="block text-sm font-medium text-theme-primary">
            Email
            <input kendoTextBox formControlName="email" placeholder="admin@master.io" class="mt-1 w-full" />
          </label>

          <label class="block text-sm font-medium text-theme-primary">
            Password
            <input
              kendoTextBox
              [type]="showPassword ? 'text' : 'password'"
              formControlName="password"
              placeholder="••••••••"
              class="mt-1 w-full"
            />
          </label>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="showPwd" (change)="showPassword = !showPassword" />
            <label for="showPwd" class="text-xs text-theme-muted cursor-pointer">Show password</label>
          </div>

          <label class="block text-sm font-medium text-theme-primary" *ngIf="captchaRequired$ | async">
            Code Captcha
            <input
              kendoTextBox
              formControlName="captcha"
              placeholder="Enter captcha code"
              class="mt-1 w-full"
            />
            <span class="text-xs text-amber-600 mt-1 block">Too many attempts — captcha required.</span>
          </label>

          <div class="flex items-center justify-between text-xs text-theme-muted">
            <span>Backend: {{ environment.apiBaseUrl }}</span>
          </div>

          <button
            kendoButton
            type="submit"
            [primary]="true"
            [disabled]="form.invalid || (!!(loading$ | async)) || (!!(accountBlocked$ | async))"
            class="w-full"
          >
            {{ (loading$ | async) ? "Signing in..." : "Sign in" }}
          </button>
          <p class="text-sm text-rose-500" *ngIf="(error$ | async) as error">{{ error }}</p>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly authFacade = inject(AuthFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private captchaSub?: Subscription;

  protected readonly environment = environment;
  protected readonly loading$: Observable<boolean> = this.authFacade.loading$;
  protected readonly error$ = this.authFacade.error$;
  protected readonly captchaRequired$ = this.authFacade.captchaRequired$;
  protected readonly accountBlocked$ = this.authFacade.accountBlocked$;

  protected showPassword = false;

  protected form = this.fb.group({
    email: ["", [Validators.required]],
    password: ["", [Validators.required]],
    captcha: [""],
  });

  ngOnInit(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
    this.authFacade.setReturnUrl(returnUrl);

    this.captchaSub = this.captchaRequired$.subscribe((required) => {
      const ctrl = this.form.get("captcha");
      if (required) {
        ctrl?.setValue("");
        ctrl?.setValidators([Validators.required]);
      } else {
        ctrl?.clearValidators();
      }
      ctrl?.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.captchaSub?.unsubscribe();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { email, password, captcha } = this.form.getRawValue();
    this.authFacade.login({
      email: email ?? "",
      password: password ?? "",
      captchaToken: captcha || undefined,
    });
  }
}
