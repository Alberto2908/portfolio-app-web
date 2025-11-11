import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthResponse {
  authenticated: boolean;
  username: string | null;
  role: string | null;
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8085/api/auth';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private usernameSubject = new BehaviorSubject<string | null>(null);
  
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public isAdmin$ = this.isAdminSubject.asObservable();
  public username$ = this.usernameSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }
  
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.authenticated) {
          this.updateAuthState(response);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of({
          authenticated: false,
          username: null,
          role: null,
          message: 'Login failed'
        });
      })
    );
  }
  
  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.clearAuthState();
        this.router.navigate(['/']);
      }),
      catchError(error => {
        console.error('Logout error:', error);
        this.clearAuthState();
        return of({
          authenticated: false,
          username: null,
          role: null,
          message: 'Logged out'
        });
      })
    );
  }
  
  checkAuthStatus(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/status`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.authenticated) {
          this.updateAuthState(response);
        } else {
          this.clearAuthState();
        }
      }),
      catchError(error => {
        console.error('Auth status check error:', error);
        this.clearAuthState();
        return of({
          authenticated: false,
          username: null,
          role: null,
          message: 'Not authenticated'
        });
      })
    );
  }
  
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
  
  isAdmin(): boolean {
    return this.isAdminSubject.value;
  }
  
  getUsername(): string | null {
    return this.usernameSubject.value;
  }
  
  private updateAuthState(response: AuthResponse): void {
    this.isAuthenticatedSubject.next(response.authenticated);
    this.isAdminSubject.next(response.role === 'ROLE_ADMIN');
    this.usernameSubject.next(response.username);
  }
  
  private clearAuthState(): void {
    this.isAuthenticatedSubject.next(false);
    this.isAdminSubject.next(false);
    this.usernameSubject.next(null);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const url = 'http://localhost:8085/api/users/me/password';
    return this.http.put<void>(url, { currentPassword, newPassword }, { withCredentials: true });
  }
}
