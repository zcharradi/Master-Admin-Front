import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { firstValueFrom } from "rxjs";

import { AuthFacade } from "@app/features/auth/+state/auth.facade";

@Component({
  selector: "app-mfa-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonsModule, InputsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)] p-6">
      <div class="w-full max-w-md rounded-3xl card-surface p-8 shadow-card">
        <p class="text-xs uppercase tracking-[0.4em] text-lagoon mb-3">MFA</p>
        <h1 class="text-2xl font-semibold text-theme-primary mb-1">Code verification</h1>
        <p class="text-sm text-theme-muted mb-6">Enter the one-time code that was sent to you.</p>

        <form class="space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
          <label class="block text-sm font-medium text-theme-primary">
            Code MFA
            <input kendoTextBox formControlName="code" maxlength="10" class="mt-1 w-full" />
          </label>

          <button
            kendoButton
            type="submit"
            [primary]="true"
            [disabled]="form.invalid || (!!(loading$ | async))"
            class="w-full"
          >
            {{ (loading$ | async) ? "Verifying..." : "Verify" }}
          </button>
          <p class="text-sm text-rose-500" *ngIf="(error$ | async) as error">{{ error }}</p>
        </form>
      </div>
    </div>
  `,
})
export class MfaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);

  protected readonly loading$ = this.authFacade.loading$;
  protected readonly error$ = this.authFacade.error$;
  protected readonly challengeId$ = this.authFacade.challengeId$;

  protected form = this.fb.group({
    code: ["", [Validators.required, Validators.minLength(4)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    const challengeId = await firstValueFrom(this.challengeId$);
    this.authFacade.verifyMfa({ challengeId: challengeId ?? "", code: this.form.value.code ?? "" });
  }
}
