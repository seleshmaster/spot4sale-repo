// src/app/features/auth/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class LoginComponent {
  private ar = inject(ActivatedRoute);
  private router = inject(Router);

  // redirect after login
  private returnTo = this.ar.snapshot.queryParamMap.get('returnTo') ?? '/search';

  // simple loading & error state
  loading = false;
  loginError: string | null = null;

  // model for ngModel binding
  model = {
    email: '',
    password: '',
  };

  private setReturnCookie(v: string) {
    document.cookie = `RETURN_TO=${encodeURIComponent(v)}; Max-Age=600; Path=/; SameSite=Lax`;
  }

  // Submit login form
  submit(f: NgForm) {
    if (f.invalid) return;

    this.loading = true;
    this.loginError = null;

    // TODO: Replace with actual login API call
    setTimeout(() => {
      this.loading = false;

      if (this.model.email === 'test@example.com' && this.model.password === 'password') {
        // success, redirect
        this.router.navigateByUrl(this.returnTo);
      } else {
        this.loginError = 'Invalid email or password';
      }
    }, 1000);
  }

  busy() {
    return this.loading;
  }

  error() {
    return this.loginError;
  }

  // Social login buttons
  goGoogle() {
    this.setReturnCookie(this.returnTo);
    window.location.href = '/oauth2/authorization/google';
  }


  goFacebook() {
    this.setReturnCookie(this.returnTo);
    window.location.href = '/oauth2/authorization/facebook';
  }
}

