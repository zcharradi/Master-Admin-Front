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
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.scss'],
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
