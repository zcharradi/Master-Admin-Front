import { Routes } from "@angular/router";

import { LoginComponent } from "./components/login.component";
import { MfaComponent } from "./components/mfa.component";
import { RegisterComponent } from "./components/register.component";

export const AUTH_ROUTES: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "en/register", component: RegisterComponent, data: { confirmationMode: true } },
  { path: "mfa", component: MfaComponent },
];
