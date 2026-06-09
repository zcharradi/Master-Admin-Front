import { HttpErrorResponse } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { finalize } from "rxjs";

import { RegisterResponse } from "@app/core/models/auth.models";
import { AuthApiService } from "@app/core/services/auth-api.service";
import { UiNotificationService } from "@app/core/services/notification.service";

@Component({
  selector: "app-register-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonsModule, InputsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)] p-6">
      <div class="w-full max-w-xl rounded-3xl card-surface p-8 shadow-card">
        <p class="text-xs uppercase tracking-[0.4em] text-lagoon mb-3">Master Admin</p>
        <h1 class="text-2xl font-semibold text-theme-primary mb-1">
          {{ confirmationMode ? "Registration confirmation" : "Create access" }}
        </h1>
        <p class="text-sm text-theme-muted mb-6">
          {{
            confirmationMode
              ? "Validating the link received by email."
              : "Enter your email to receive the creation link."
          }}
        </p>

        <form class="space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
          <label class="block text-sm font-medium text-theme-primary">
            Email
            <input
              kendoTextBox
              formControlName="email"
              type="email"
              placeholder="admin@master.io"
              class="mt-1 w-full"
              [readonly]="confirmationMode && !!verifiedEmail"
            />
          </label>
          <p class="text-xs text-rose-500" *ngIf="form.controls.email.invalid && form.controls.email.touched">
            A valid email address is required.
          </p>

          <button
            kendoButton
            type="submit"
            [primary]="true"
            [disabled]="form.invalid || loading"
            class="w-full"
          >
            {{
              loading
                ? (confirmationMode ? "Verifying..." : "Sending...")
                : (confirmationMode ? "Resend link" : "Send link")
            }}
          </button>
        </form>

        <div
          *ngIf="statusMessage"
          class="mt-4 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-3"
        >
          {{ statusMessage }} <span *ngIf="verifiedEmail">({{ verifiedEmail }})</span>
        </div>

        <div
          *ngIf="errorMessage"
          class="mt-3 text-sm bg-rose-50 text-rose-600 border border-rose-200 rounded-xl p-3"
        >
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly notifications = inject(UiNotificationService);
  private readonly route = inject(ActivatedRoute);

  protected loading = false;
  protected statusMessage: string | null = null;
  protected errorMessage: string | null = null;
  protected confirmationMode = false;
  protected verifiedEmail: string | null = null;

  protected form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.confirmationMode =
      this.route.snapshot.data?.["confirmationMode"] === true || !!this.route.snapshot.queryParamMap.get("email");
    const emailToken = this.route.snapshot.queryParamMap.get("email");

    if (this.confirmationMode && emailToken) {
      this.verifyToken(emailToken);
    } else if (this.confirmationMode) {
      this.errorMessage = "Invalid or expired link.";
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.statusMessage = null;
    this.errorMessage = null;

    const email = this.form.getRawValue().email ?? "";

    this.authApi
      .requestRegister(email)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => this.handleRegisterSuccess(response),
        error: (error: HttpErrorResponse) => this.handleRegisterError(error),
      });
  }

  private verifyToken(token: string): void {
    this.loading = true;
    this.statusMessage = null;
    this.errorMessage = null;

    this.authApi
      .verifyRegisterToken(token)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.verifiedEmail = response.email ?? null;
          this.statusMessage = response.message;
          if (response.email) {
            this.form.setValue({ email: response.email });
            this.form.controls.email.disable();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractError(error);
          this.notifications.error(this.errorMessage);
        },
      });
  }

  private handleRegisterSuccess(response: RegisterResponse): void {
    if (response.code === "EMAIL_EXISTS") {
      this.errorMessage = response.message;
      this.statusMessage = null;
      this.notifications.warning(response.message);
      return;
    }

    this.statusMessage = response.message;
    this.notifications.success(response.message);
  }

  private handleRegisterError(error: HttpErrorResponse): void {
    const message = this.extractError(error);
    this.errorMessage = message;
    this.notifications.error(message);
  }

  private extractError(error: HttpErrorResponse): string {
    const apiMessage = (error.error && (error.error.message || error.error.error)) ?? error.message;
    return apiMessage || "An error occurred.";
  }
}
