import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { map, take } from "rxjs";

import { AuthFacade } from "@app/features/auth/+state/auth.facade";
import { TokenService } from "@app/core/services/token.service";

export const authGuard: CanActivateFn = (_route, state) => {
  const facade = inject(AuthFacade);
  const router = inject(Router);
  const tokenService = inject(TokenService);

  // Hydrate the profile when a token exists in storage.
  facade.loadProfileIfNeeded();

  return facade.isAuthenticated$.pipe(
    take(1),
    map((isAuth) => {
      const hasStoredToken = !!tokenService.getAccessToken();
      if (!isAuth && hasStoredToken) {
        // Token is available in local storage; let navigation continue while profile loads.
        return true;
      }

      return isAuth ? true : router.createUrlTree(["/login"], { queryParams: { returnUrl: state.url } });
    })
  );
};
