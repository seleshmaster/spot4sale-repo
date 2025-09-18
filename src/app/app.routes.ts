import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { HostSearchComponent } from './features/hosts/host-search.component';
import { HomeComponent } from './home.component';
import { authGuard } from './core/auth.guard';
import { ownerGuard } from './core/owner.guard';
import { BookingComponent } from './features/booking/booking.component';
import { HostCreateComponent } from './features/hosts/host-create.component';
import { BookingConfirmComponent } from './features/booking/booking-confirm.component';
import { HostEditComponent } from './features/hosts/host-edit.component';
import {OwnerDashboardComponent} from './features/owner/owner-dashboard.component';
import {HostListComponent} from './features/hosts/host-list.component';

export const routes: Routes = [
  // Home redirect
  { path: '', pathMatch: 'full', redirectTo: 'search' },

  // Public
  { path: 'login', component: LoginComponent },
  { path: 'search', component: HostListComponent },
  { path: 'owner', component: OwnerDashboardComponent },

  // Static first: create store
  { path: 'stores/create', component: HostCreateComponent, canActivate: [authGuard] },

  // Dynamic routes next
  { path: 'stores/:storeId/edit', component: HostEditComponent, canActivate: [ownerGuard] },
  { path: 'stores/:storeId/spots/manage', canActivate: [authGuard],
    loadComponent: () => import('./features/hosts/host-booths-manage.component')
      .then(m => m.HostBoothsManageComponent)
  },

  // Booking
  { path: 'book/:spotId', component: BookingComponent, canActivate: [authGuard] },
  { path: 'booking/confirm/:id', component: BookingConfirmComponent, canActivate: [authGuard] },
  { path: 'bookings', canActivate: [authGuard],
    loadComponent: () => import('./features/booking/my-bookings.component')
      .then(m => m.MyBookingsComponent)
  },

  // Owner dashboard / availability
  { path: 'owner', canActivate: [authGuard],
    loadComponent: () => import('./features/owner/owner-dashboard.component')
      .then(m => m.OwnerDashboardComponent)
  },
  { path: 'owner/availability', canActivate: [authGuard], // ownerGuard optional
    loadComponent: () => import('./features/owner/owner-availability.component')
      .then(m => m.OwnerAvailabilityComponent)
  },

  // Catch-all
  { path: '**', redirectTo: 'search' }
];
