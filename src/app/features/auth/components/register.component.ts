import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { finalize } from "rxjs";

import { RegisterResponse, RegisterVerificationResponse } from "@app/core/models/auth.models";
import { UiNotificationService } from "@app/core/services/notification.service";
import { environment } from "@environments/environment";

@Component({
  selector: "app-register-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonsModule, InputsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
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

    this.http
      .post<RegisterResponse>(`${environment.apiBaseUrl}/api/auth/register/request`, { email })
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

    const params = new HttpParams().set("email", token);

    this.http
      .get<RegisterVerificationResponse>(`${environment.apiBaseUrl}/api/auth/register/verify`, { params })
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
