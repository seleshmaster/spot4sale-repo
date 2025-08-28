import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const ownerGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1) Get cached user
  let user = auth.me(); // private, may need a getter or make me() signal readonly

  // 2) If unknown, fetch from backend
  if (!user) {
    try {
      user = await firstValueFrom(auth.fetchMe().pipe(catchError(() => of(null))));
    } catch {
      return router.createUrlTree(['/login'], { queryParams: { returnTo: state.url } });
    }
  }

  if (!user) {
    console.log('User not logged in → redirect to login');
    return router.createUrlTree(['/login'], { queryParams: { returnTo: state.url } });
  }

  console.log('User object from guard:', user);

  const roles: string[] = [];
  if (user.role) roles.push(user.role);
  if (Array.isArray(user.authorities)) {
    user.authorities.forEach(a => roles.push(a.authority));
  }

  console.log('User roles:', roles);

  const isOwner = roles
    .filter(r => !!r)                     // remove null/undefined
    .some(r => r.toUpperCase() === 'STORE_OWNER' || r.toUpperCase() === 'ROLE_STORE_OWNER');

  if (!isOwner) {
    console.log('User is NOT owner → redirecting');
    return router.createUrlTree(['/stores/create']);
  }

  console.log('User is OWNER → access granted');
  return true;
};
