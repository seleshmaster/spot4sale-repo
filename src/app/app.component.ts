import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthWidgetComponent } from './shared/auth-widget.component';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, AuthWidgetComponent],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  goLogin() {
    const returnTo = this.router.url || '/search';
    this.router.navigate(['/login'], { queryParams: { returnTo } });
  }
}
