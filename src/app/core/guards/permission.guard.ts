import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { combineLatest, filter, map, of, take } from "rxjs";

import { AuthFacade } from "@app/features/auth/+state/auth.facade";

export const permissionGuard: CanActivateFn = (route, state) => {
  const claims = (route.data?.["claims"] as string[] | undefined) ?? [];
  const facade = inject(AuthFacade);
  const router = inject(Router);

  if (!claims.length) {
    return of(true);
  }

  // Ensure profile is requested when a token exists (page refresh, direct link, etc.).
  facade.loadProfileIfNeeded();

  return combineLatest([facade.claims$, facade.isAuthenticated$, facade.loading$]).pipe(
    // Wait until any in-flight profile load finishes to avoid false negatives on claims.
    filter(([, , loading]) => !loading),
    take(1),
    map(([userClaims, isAuthenticated]) => {
      const allowed = claims.every((claim) => userClaims.includes(claim));
      return isAuthenticated && allowed
        ? true
        : router.createUrlTree(["/login"], { queryParams: { returnUrl: state.url } });
    })
  );
};
