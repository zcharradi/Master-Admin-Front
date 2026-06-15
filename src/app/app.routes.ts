import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

export const appRoutes: Routes = [
  // Auth routes (no layout / empty layout)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'en/register',
    data: { confirmationMode: true },
    loadComponent: () =>
      import('./features/auth/components/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Protected routes with Fuse layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'tenants',
        data: { claims: ['tenants:read'] },
        loadChildren: () =>
          import('./features/tenants/tenants.routes').then((m) => m.TENANTS_ROUTES),
      },
      {
        path: 'db-instances',
        data: { claims: ['db:read'] },
        loadChildren: () =>
          import('./features/db-instances/db-instances.routes').then((m) => m.DB_INSTANCE_ROUTES),
      },
      {
        path: 'erp-users',
        data: { claims: ['users:read'] },
        loadChildren: () =>
          import('./features/erp-users/erp-users.routes').then((m) => m.ERP_USER_ROUTES),
      },
      {
        path: 'master-admins',
        data: { claims: ['admins:read'] },
        loadChildren: () =>
          import('./features/master-admins/master-admins.routes').then(
            (m) => m.MASTER_ADMIN_ROUTES,
          ),
      },
      {
        path: 'global-config',
        data: { claims: ['config:read'] },
        loadChildren: () =>
          import('./features/global-config/global-config.routes').then(
            (m) => m.GLOBAL_CONFIG_ROUTES,
          ),
      },
      {
        path: 'industries',
        loadChildren: () =>
          import('./features/industries/industries.routes').then((m) => m.INDUSTRY_ROUTES),
      },
      {
        path: 'references',
        loadChildren: () =>
          import('./features/references/references.routes').then((m) => m.REFERENCE_ROUTES),
      },
       {
        path: 'operations',
        loadChildren: () =>
          import('./features/operations/operations.routes').then((m) => m.OPERATION_ROUTES),
      },
      {
        path: 'articles',
        loadChildren: () =>
          import('./features/articles/articles.routes').then((m) => m.ARTICLES_ROUTES),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
