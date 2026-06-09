# Master ERP V3 Portal (Angular 21 + Kendo UI)

## Setup
1. Installer les deps : `npm install`
2. Lancer le dev server : `npm start` (http://localhost:4200)
3. Build prod : `npm run build`
4. Générer les clients API Swagger : `npm run swagger:generate` (lit la doc https://localhost:7163/swagger/v1/swagger.json)

## Environnements
- Fichier central : `src/environments/environment.ts`
- URL API par defaut : `https://localhost:7163`
- Clefs token: `master-erp-token` / `master-erp-refresh`
- Remplacement prod/dev configure dans `angular.json`

## Pile technique
- Angular 21 (standalone, lazy routes)
- Kendo UI Angular + theme default + TailwindCSS
- NgRx 21 (store/effects/entity/router-store) par feature
- Intercepteurs HTTP : auth (Bearer) + erreur (401/403/500) + notifications

## Architecture
- `src/app/core`: layout (shell), intercepteurs, gardes, services HTTP, notifications
- `src/app/features/*`: une feature = routes lazy + state NgRx (+state actions/reducer/effects/selectors) + composants Kendo
- `src/app/shared`: composants UI (page-header, stat-card), constantes Kendo, helpers de state
- Auth: login + MFA + guard + facade; tokens stockes en localStorage
- Layout: sidebar + topbar (API info, user, logout) + router-outlet

## Modules couverts
- Dashboard (stats + alertes)
- Tenants (grid + filtres + creation rapide)
- DB Instances (grid + toggle actif + formulaire credentials masque)
- ERP Users (activation/blocage/reset flag)
- Master Admins (blocage, MFA flag)
- Global Config (password policy/MFA/captcha + endpoint secrets)
- Modules / Industries / Referentiels (catalogues simples, Kendo Grid)

## Conventions NgRx
- Aucun appel HTTP depuis les composants; tout passe par Effects + services API
- State liste base via `ListState` (loading/error/pagination/filters/selectedId)
- Guards: `authGuard` pour la session, `permissionGuard` (claims backend)

## Notes securite
- Champs secrets jamais affiches; updates via endpoints dedies (global config, DB credentials)
- AuthInterceptor ajoute automatiquement le Bearer token
- Sur 401 -> tentative de refresh puis logout

## Tailwind/Kendo
- Theme charge dans `src/styles.scss` avec Tailwind (deps installees)
- Warnings Sass @import (deprecation) visibles au build, sans impact fonctionnel

## Swagger
- Pointer le portail vers la doc Swagger/OpenAPI exposee par le backend (`https://localhost:7163/swagger` par defaut)
