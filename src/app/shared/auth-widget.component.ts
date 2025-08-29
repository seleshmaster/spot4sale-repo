import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'auth-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'auth-widget.component.html',
  styleUrls: ['auth-widget.component.scss']
})
export class AuthWidgetComponent {
  private auth = inject(AuthService);
  loggedIn = this.auth.isLoggedIn;
  name = computed(() => this.auth.me()?.name ?? '');

  login(){ this.auth.loginWithGoogle(); }
  logout(){ this.auth.logout(); }

}
