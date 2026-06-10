import { CommonModule, AsyncPipe, NgFor, NgIf } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ButtonsModule } from "@progress/kendo-angular-buttons";

import { AuthFacade } from "@app/features/auth/+state/auth.facade";
import { environment } from "@environments/environment";

interface NavItem {
  label: string;
  path: string;
  description?: string;
  claim?: string;
}

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonsModule, NgFor, NgIf, AsyncPipe],
  styles: [
    `
      :host {
        display: block;
      }

      .app-shell {
        min-height: 100vh;
        display: flex;
        background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
        color: var(--text-primary);
        transition: background 150ms ease, color 150ms ease;
      }

      .surface {
        background-color: var(--surface);
        border-color: var(--border);
        backdrop-filter: blur(12px);
      }

      .nav-link {
        color: var(--text-muted);
      }

      .nav-link:hover,
      .nav-link.active {
        color: var(--text-primary);
        background-color: rgba(255, 255, 255, 0.1);
      }

      .muted {
        color: var(--text-muted);
      }

      .user-action {
        position: relative;
      }

      .user-menu {
        position: absolute;
        right: 0;
        top: 110%;
        display: none;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 0.5rem;
        box-shadow: 0 12px 30px -12px rgba(0, 0, 0, 0.25);
        min-width: 160px;
        z-index: 10;
        color: var(--text-primary);
      }

      .user-action:hover .user-menu {
        display: block;
      }

      .user-action:focus-within .user-menu {
        display: block;
      }

      .app-shell.theme-dark .user-menu {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.12);
      }
    `,
  ],
  template: `
    <div class="app-shell" [class.theme-dark]="currentTheme === 'dark'" [class.theme-light]="currentTheme === 'light'">
      <aside class="hidden lg:flex w-64 flex-col border-r surface">
        <div class="p-6 border-b surface">
          <p class="text-xs tracking-[0.4em] uppercase muted">ERP Master</p>
          <h2 class="text-xl font-semibold">Portal V3</h2>
        </div>
        <nav class="flex-1 p-4 space-y-2">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.path"
            routerLinkActive="active"
            class="block px-3 py-3 rounded-xl text-sm nav-link transition"
          >
            <div class="font-semibold">{{ item.label }}</div>
            <p class="text-xs muted" *ngIf="item.description">{{ item.description }}</p>
          </a>
        </nav>
      </aside>

      <div class="flex-1 flex flex-col">
        <header class="surface flex items-center justify-between gap-4 px-4 md:px-6 py-4 border-b">
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-[0.3em] text-lagoon">Master Portal</p>
            <h1 class="text-lg font-semibold text-theme-primary">ERP Master V3</h1>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative flex items-center gap-2" *ngIf="user$ | async as user">
              <div class="user-action">
                <button kendoButton look="outline" themeColor="light" class="flex items-center gap-2">
                  <div class="text-right">
                    <p class="text-sm font-semibold text-theme-primary">{{ user.fullName || user.email }}</p>
                    <p class="text-xs muted">Master Admin</p>
                  </div>
                </button>
                <div class="user-menu">
                  <button kendoButton look="flat" themeColor="primary" (click)="toggleTheme()">
                    Theme {{ currentTheme === "dark" ? "light" : "dark" }}
                  </button>
                  <button kendoButton look="clear" (click)="logout()">Logout</button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 p-4 md:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent implements OnInit {
  private readonly authFacade = inject(AuthFacade);

  protected readonly environment = environment;
  protected readonly apiBaseUrl = environment.apiBaseUrl;
  protected readonly user$ = this.authFacade.user$;
  protected readonly isLoading$ = this.authFacade.loading$;

  protected currentTheme: "dark" | "light" = "light";

  protected navItems: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", description: "Global overview" },
    { label: "Tenants", path: "/tenants", description: "Multi-tenant & modules" },
    { label: "DB Instances", path: "/db-instances", description: "PostgreSQL instances" },
    { label: "ERP Users", path: "/erp-users", description: "ERP accounts" },
    { label: "Master Admins", path: "/master-admins", description: "Portal supervision" },
    { label: "Global Config", path: "/global-config", description: "Security & SMTP" },
    { label: "Industries", path: "/industries", description: "Industries & clients" },
    { label: "References", path: "/references", description: "Countries, currencies, templates" },
  ];

  ngOnInit(): void {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      this.currentTheme = saved;
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.setAttribute("data-theme", this.currentTheme);
    localStorage.setItem("theme", this.currentTheme);
  }

  logout(): void {
    this.authFacade.logout();
  }
}
