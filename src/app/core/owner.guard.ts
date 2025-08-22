import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { firstValueFrom, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const ownerGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1) If we already know the user
  const known = auth.me(); // undefined = loading/not fetched, null = logged out, object = logged in
  if (known !== undefined) {
    if (known === null) {
      // Not logged in → go to login
      return router.createUrlTree(['/login'], { queryParams: { returnTo: state.url } });
    }
    // Logged in; check role
    return hasOwnerRole(known) ? true : router.createUrlTree(['/stores/create']);
  }

  // 2) Unknown state → fetch /me once, then decide
  try {
    const u = await firstValueFrom(
      auth.fetchMe().pipe(
        catchError(() => of(null)) // treat errors as logged-out
      )
    );
    if (!u) {
      return router.createUrlTree(['/login'], { queryParams: { returnTo: state.url } });
    }
    return hasOwnerRole(u) ? true : router.createUrlTree(['/stores/create']);
  } catch {
    return router.createUrlTree(['/login'], { queryParams: { returnTo: state.url } });
  }
};

function hasOwnerRole(u: any): boolean {
  // Adjust to your shape: could be u.role === 'STORE_OWNER' or an array of authorities
  return u.role === 'STORE_OWNER' ||
    u.authorities?.some((a: any) => (a.authority || a) === 'ROLE_STORE_OWNER');
}
