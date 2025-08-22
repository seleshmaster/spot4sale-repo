import { LoginComponent } from './features/auth/login.component';
import {StoreSearchComponent} from './features/stores/store-search.component';
import {HomeComponent} from './home.component';
import {Routes} from '@angular/router';
import {authGuard} from './core/auth.guard';
import {BookingComponent} from './features/booking/booking.component';
import {ownerGuard} from './core/owner.guard';
import {StoreCreateComponent} from './features/stores/store-create.component';
import { BookingConfirmComponent } from './features/booking/booking-confirm.component';
import { BookingsListComponent } from './features/booking/bookings-list.component';



export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'search', component: StoreSearchComponent },

  // Protected pages
  { path: 'book/:spotId', component: BookingComponent, canActivate: [authGuard] },
  { path: 'store/new', component: StoreCreateComponent, canActivate: [authGuard, ownerGuard] }, // ownerGuard optional
  { path: 'booking/confirm/:id', component: BookingConfirmComponent, canActivate: [authGuard] },
  { path: 'bookings', component: BookingsListComponent, canActivate: [authGuard] },
  { path: 'stores/create', canActivate: [authGuard], loadComponent: () => import('./features/stores/store-create.component').then(m => m.StoreCreateComponent) },

  { path: 'stores/:storeId/spots/manage',
    canActivate: [authGuard],
    loadComponent: () => import('./features/stores/store-spots-manage.component')
      .then(m => m.StoreSpotsManageComponent)
  },

  {
    path: 'bookings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking/my-bookings.component')
      .then(m => m.MyBookingsComponent)
  },

  {
    path: 'owner',
    canActivate: [authGuard],
    loadComponent: () => import('./features/owner/owner-dashboard.component')
      .then(m => m.OwnerDashboardComponent)
  },

  { path: '**', redirectTo: 'search' }
];
