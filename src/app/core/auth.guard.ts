// src/app/core/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;
  await auth.loadMe();
  if (auth.isLoggedIn()) return true;

  const returnTo = state.url || '/search'; // ← use the attempted URL here
  return router.parseUrl('/login?returnTo=' + encodeURIComponent(returnTo));
};
