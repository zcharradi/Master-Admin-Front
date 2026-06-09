import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LOCALE_ID } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';
import { BASE_PATH, Configuration } from '@swagger';
import { provideFuse } from '@fuse';

import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authFeature } from './features/auth/+state/auth.reducer';
import { AuthEffects } from './features/auth/+state/auth.effects';
import { provideIcons } from './core/icons/icons.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideStore(),
    provideRouterStore(),
    provideState(authFeature),
    provideEffects([AuthEffects]),
    { provide: LOCALE_ID, useValue: 'en-US' },
    { provide: BASE_PATH, useValue: environment.apiBaseUrl },
    {
      provide: Configuration,
      useFactory: () => new Configuration({ basePath: environment.apiBaseUrl, withCredentials: true }),
    },
    provideStoreDevtools({
      maxAge: 25,
      trace: false,
      logOnly: environment.production,
    }),
    provideIcons(),
    provideFuse({
      fuse: {
        layout: 'classy',
        scheme: 'light',
        screens: {
          sm: '600px',
          md: '960px',
          lg: '1280px',
          xl: '1440px',
        },
        theme: 'theme-default',
        themes: [
          { id: 'theme-default', name: 'Default' },
          { id: 'theme-brand', name: 'Brand' },
          { id: 'theme-teal', name: 'Teal' },
          { id: 'theme-rose', name: 'Rose' },
        ],
      },
    }),
  ],
};
