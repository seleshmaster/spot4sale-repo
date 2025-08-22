import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'auth-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loggedIn(); else loginTpl" class="me">
      <span>{{ name() }}</span>
      <button type="button" (click)="logout()">Logout</button>
    </div>
    <ng-template #loginTpl>
      <button type="button" (click)="login()">Continue with Google</button>
    </ng-template>
  `,
  styles:[`.me{display:flex;gap:8px;align-items:center}`]
})
export class AuthWidgetComponent {
  private auth = inject(AuthService);
  loggedIn = this.auth.isLoggedIn;
  name = computed(() => this.auth.me()?.name ?? '');

  login(){ this.auth.loginWithGoogle(); }
  logout(){ this.auth.logout(); }
}
