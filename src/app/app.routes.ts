import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { StoreSearchComponent } from './features/stores/store-search.component';
import { HomeComponent } from './home.component';
import { authGuard } from './core/auth.guard';
import { ownerGuard } from './core/owner.guard';
import { BookingComponent } from './features/booking/booking.component';
import { StoreCreateComponent } from './features/stores/store-create.component';
import { BookingConfirmComponent } from './features/booking/booking-confirm.component';
import { StoreEditComponent } from './features/stores/store-edit.component';
import {OwnerDashboardComponent} from './features/owner/owner-dashboard.component';
import {StoreListComponent} from './features/stores/store-list.component';

export const routes: Routes = [
  // Home redirect
  { path: '', pathMatch: 'full', redirectTo: 'search' },

  // Public
  { path: 'login', component: LoginComponent },
  { path: 'search', component: StoreListComponent },
  { path: 'owner', component: OwnerDashboardComponent },

  // Static first: create store
  { path: 'stores/create', component: StoreCreateComponent, canActivate: [authGuard] },

  // Dynamic routes next
  { path: 'stores/:storeId/edit', component: StoreEditComponent, canActivate: [ownerGuard] },
  { path: 'stores/:storeId/spots/manage', canActivate: [authGuard],
    loadComponent: () => import('./features/stores/store-spots-manage.component')
      .then(m => m.StoreSpotsManageComponent)
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
