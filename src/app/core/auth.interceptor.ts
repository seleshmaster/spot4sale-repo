import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authRedirectOn401Interceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Only redirect for protected API calls, not the initial /api/auth/me probe.
      const isApi = req.url.startsWith('/api/');
      const isMe = req.url.startsWith('/api/auth/me');
      if (err.status === 401 && isApi && !isMe) {
        window.location.href = '/oauth2/authorization/google';
        // Return here to stop further processing
        return throwError(() => err);
      }
      return throwError(() => err);
    })
  );
};
