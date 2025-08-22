import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthWidgetComponent } from './shared/auth-widget.component';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, AuthWidgetComponent],
  template: `
    <header class="nav">
      <a routerLink="/" class="brand">Spot4Sale</a>
      <a routerLink="/bookings" *ngIf="auth.isLoggedIn()">My Bookings</a>

      <nav><a routerLink="/search">Find a Spot</a></nav>
      <a routerLink="/stores/create" *ngIf="auth.isLoggedIn()">Create Store</a>

      <!-- When logged out, show a Login button that sends the user to /login?returnTo=<current-url> -->
      <button *ngIf="!auth.isLoggedIn()" (click)="goLogin()">Login</button>

      <!-- Keep your existing widget (shows user info / logout) -->
      <auth-widget/>
    </header>

    <main class="container"><router-outlet/></main>
  `,
  styles: [`
    .nav{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:12px;border-bottom:1px solid #eee}
    .brand{font-weight:700;text-decoration:none}
    .container{padding:16px;max-width:1000px;margin:0 auto}
    nav a{margin-right:12px}
  `]
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  goLogin() {
    const returnTo = this.router.url || '/search';
    this.router.navigate(['/login'], { queryParams: { returnTo } });
  }
}
