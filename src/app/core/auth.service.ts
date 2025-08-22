import { Injectable, Signal, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {firstValueFrom, Observable, shareReplay, tap} from 'rxjs';
import {environment} from '../../environments/environment';

export interface MeResponse {
  name: string;
  authorities: { authority: string }[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);


  private _me = signal<MeResponse | null>(null);
  me = this._me.asReadonly();
  isLoggedIn = computed(() => this._me() !== null);

  /** Load the current user once at startup (safe to call multiple times). */
  async loadMe(): Promise<void> {
    try {
      const m = await firstValueFrom(this.http.get<MeResponse>('/api/auth/me'));
      this._me.set(m as MeResponse);
    } catch {
      this.clearMe();
    }
  }

  /** Guard helper */
  requireLogin(): boolean {
    if (this.isLoggedIn()) return true;
    this.loginWithGoogle();
    return false;
  }

  loginWithGoogle() { window.location.href = '/oauth2/authorization/google'; }

  async logout() {
    try {
      // 1) Tell Spring to end the session; include cookies!
      await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' } // helps some proxies
      });
    } catch {
      // ignore network blips; we still clear client state
    } finally {
      // 2) Re-check server state; me() should become null (401 from backend)
      try { await this.loadMe(); } catch {}

      // 3) Force-clear client state anyway to flip the UI immediately
      this.clearMe();

      // 4) Go to SPA login
      window.location.href = '/login';
    }
  }

  clearMe() { console.log('[auth] clearMe()'); this._me.set(null); }

  fetchMe(): Observable<any|null> {
    return this.http.get<any>(`${environment.apiBase}/auth/me`).pipe(
      tap(user => this._me.set(user)),
      shareReplay(1)
    );
  }

}
