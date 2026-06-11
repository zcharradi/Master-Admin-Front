import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { Observable, Subscription } from "rxjs";

import { AuthFacade } from "@app/features/auth/+state/auth.facade";

@Component({
  selector: "app-login-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonsModule, InputsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly authFacade = inject(AuthFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private captchaSub?: Subscription;

  protected readonly loading$: Observable<boolean> = this.authFacade.loading$;
  protected readonly error$ = this.authFacade.error$;
  protected readonly captchaRequired$ = this.authFacade.captchaRequired$;
  protected readonly accountBlocked$ = this.authFacade.accountBlocked$;

  protected showPassword = false;

  protected readonly features = [
    {
      label: "Authentification sécurisée par token Bearer",
      icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
    },
    {
      label: "Authentification multi-facteurs (MFA)",
      icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3H9m1.5-12H9",
    },
    {
      label: "Contrôle d'accès basé sur les rôles",
      icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    },
  ];

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
