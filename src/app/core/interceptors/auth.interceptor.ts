import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { TokenService } from "@app/core/services/token.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getAccessToken();
  const authorized = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authorized);
};
