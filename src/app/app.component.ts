import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthWidgetComponent } from './shared/auth-widget.component';
import { AuthService } from './core/auth.service';
import { FormsModule } from '@angular/forms';  // <- add this

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet, AuthWidgetComponent],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  // <-- add these two lines
  city: string = '';
  zip: string = '';

  goLogin() {
    const returnTo = this.router.url || '/search';
    this.router.navigate(['/login'], { queryParams: { returnTo } });
  }

  goSearch() {
    const queryParams: any = {};
    if (this.city.trim()) queryParams.city = this.city.trim();
    if (this.zip.trim()) queryParams.zip = this.zip.trim();

    console.log('Searching with params:', queryParams);

    this.router.navigate(['/search'], { queryParams });
  }



  useMyLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.router.navigate(['/search'], {
          queryParams: { lat: coords.latitude, lng: coords.longitude }
        });
      },
      err => alert('Could not get location: ' + err.message)
    );
  }


  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}


