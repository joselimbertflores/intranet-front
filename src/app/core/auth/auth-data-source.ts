import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AuthDataSource {
  private readonly URL = `${environment.baseUrl}/auth`;

  private http = inject(HttpClient);

  private _user = signal<any>(null);
  user = computed(() => this._user());

  constructor() {}

  login(login: string, password: string, remember: boolean = false) {
    if (remember) {
      localStorage.setItem('login', login);
    } else {
      localStorage.removeItem('login');
    }
    return this.http
      .post(`${this.URL}/login`, { login, password }, { withCredentials: true })
      .pipe(
        tap((resp) => {
          console.log(resp);
        })
      );
  }

  logout() {
    return this.http.get(`${this.URL}/logout`, { withCredentials: true });
  }

  checkAuthStatus() {
    return this.http
      .get<{ user: any }>(`${this.URL}/status`, { withCredentials: true })
      .pipe(
        tap(({ user }) => this._user.set(user)),
        map(() => true),
        catchError((err) => {
          console.log(err);
          return of(false);
        })
      );
  }
}
