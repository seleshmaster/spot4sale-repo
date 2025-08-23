import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { StoreSearchComponent } from './features/stores/store-search.component';
import { HomeComponent } from './home.component';
import { authGuard } from './core/auth.guard';
import { ownerGuard } from './core/owner.guard';
import { BookingComponent } from './features/booking/booking.component';
import { StoreCreateComponent } from './features/stores/store-create.component';
import { BookingConfirmComponent } from './features/booking/booking-confirm.component';

export const routes: Routes = [
  // Home OR redirect — choose ONE. Here we redirect to /search:
  { path: '', pathMatch: 'full', redirectTo: 'search' },

  // Public
  { path: 'login', component: LoginComponent },
  { path: 'search', component: StoreSearchComponent },

  // Protected
  { path: 'book/:spotId', component: BookingComponent, canActivate: [authGuard] },
  // Either keep this eager…
  { path: 'stores/create', component: StoreCreateComponent, canActivate: [authGuard] },
  // …or lazy:
  // { path: 'stores/create', canActivate: [authGuard],
  //   loadComponent: () => import('./features/stores/store-create.component').then(m => m.StoreCreateComponent)
  // },

  { path: 'booking/confirm/:id', component: BookingConfirmComponent, canActivate: [authGuard] },

  // Use ONLY ONE bookings route — keep the one that has the Cancel button (MyBookingsComponent)
  { path: 'bookings', canActivate: [authGuard],
    loadComponent: () => import('./features/booking/my-bookings.component').then(m => m.MyBookingsComponent)
  },

  { path: 'stores/:storeId/spots/manage', canActivate: [authGuard],
    loadComponent: () => import('./features/stores/store-spots-manage.component').then(m => m.StoreSpotsManageComponent)
  },

  // Optional owner dashboard
  { path: 'owner', canActivate: [authGuard],
    loadComponent: () => import('./features/owner/owner-dashboard.component').then(m => m.OwnerDashboardComponent)
  },

  { path: '**', redirectTo: 'search' }
];
