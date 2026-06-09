import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";

import { AuthFacade } from "@app/features/auth/+state/auth.facade";
import { UiNotificationService } from "@app/core/services/notification.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(UiNotificationService);
  const authFacade = inject(AuthFacade);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Skip for auth endpoints to prevent infinite refresh loops.
        // When /auth/refresh-token returns 401, refreshToken$ handles it via catchError → refreshTokenFailure.
        const isAuthEndpoint = req.url.includes('/auth/') || req.url.includes('/login');
        if (!isAuthEndpoint) {
          authFacade.handleUnauthorized();
        }
      } else if (error.status === 403) {
        notifications.warning("Access denied for this resource");
      } else if (error.status >= 500) {
        notifications.error("Server error, please try again");
      } else {
        notifications.fromHttpError(error);
      }
      return throwError(() => error);
    })
  );
};
