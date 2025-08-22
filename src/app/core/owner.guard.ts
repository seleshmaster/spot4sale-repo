import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

function hasOwnerRole(me: { authorities: { authority: string }[] } | null): boolean {
  return !!me?.authorities?.some(a =>
    a.authority === 'ROLE_STORE_OWNER' || a.authority === 'STORE_OWNER' || a.authority === 'ROLE_ADMIN'
  );
}

export const ownerGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    const returnTo = router.url || '/search';
    return router.parseUrl('/login?returnTo=' + encodeURIComponent(returnTo));
  }

  const me = auth.me();
  if (hasOwnerRole(me)) return true;

  // fetch once if me is not loaded yet
  if (!me) { await auth.loadMe(); }
  if (hasOwnerRole(auth.me())) return true;

  // no permission → send to search or a /forbidden page if you have one
  return router.parseUrl('/search');
};
