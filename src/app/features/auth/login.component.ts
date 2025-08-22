// src/app/features/auth/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  template: `
    <h2>Login</h2>
    <p>Use your Google account to continue.</p>
    <button (click)="goGoogle()">Continue with Google</button>
  `,
  imports: [CommonModule]
})
export class LoginComponent {
  private ar = inject(ActivatedRoute);

  private returnTo = this.ar.snapshot.queryParamMap.get('returnTo') ?? '/search';

  private setReturnCookie(v: string) {
    document.cookie = `RETURN_TO=${encodeURIComponent(v)}; Max-Age=600; Path=/; SameSite=Lax`;
  }
  goGoogle() {
    this.setReturnCookie(this.returnTo);
    window.location.href = '/oauth2/authorization/google';
  }
}
