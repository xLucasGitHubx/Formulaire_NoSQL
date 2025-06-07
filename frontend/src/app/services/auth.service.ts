import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:9000/api';
  token = signal<string | null>(localStorage.getItem('token'));
  token$ = this.token.asReadonly(); // expose en lecture seule

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.API}/login`, { email, password });
  }

  register(email: string, password: string) {
    return this.http.post(`${this.API}/register`, { email, password });
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    this.token.set(token);
  }

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }
}
