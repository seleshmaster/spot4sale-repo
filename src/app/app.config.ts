import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAppInitializer } from '@angular/core';
import { routes } from './app.routes';
import { AuthService } from './core/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return auth.loadMe(); // calls /api/auth/me and fills the signal
    }),
  ],
};
