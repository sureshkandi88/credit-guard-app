import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, UserProfile } from '../models/auth.model';

// Signup request interface
interface SignupRequest {
  username: string;
  email: string;
  password: string;
  secretQuestion: string;
  secretAnswer: string;
  firstName?: string;
  lastName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'credit_guard_auth_token';
  private readonly USER_PROFILE_KEY = 'credit_guard_user_profile';
  private readonly TOKEN_KEY = 'credit_guard_auth_token';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Subscribe to authentication state changes
    this.isAuthenticated$.subscribe((isAuthenticated) => {
      console.group('Authentication State Change');
      console.log('Is Authenticated:', isAuthenticated);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    });

    // Check for existing token and user profile on service initialization
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.authBaseUrl}/login`, credentials)
      .pipe(
        tap((response: LoginResponse) => this.handleAuthentication(response)),
        catchError((error: HttpErrorResponse) => {
          // Log the error and rethrow
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  signup(signupRequest: SignupRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.authBaseUrl}/register`, signupRequest)
      .pipe(
        tap((response) => {
          // Store authentication token
          localStorage.setItem(this.TOKEN_KEY, response.token);

          // Update user profile
          const userProfile: UserProfile = {
            id: response.userId,
            username: response.username,
            role: response.role,
          };

          // Store user profile
          localStorage.setItem(
            this.USER_PROFILE_KEY,
            JSON.stringify(userProfile)
          );

          // Update current user subject and authentication state
          this.currentUserSubject.next(userProfile);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(this.handleError)
      );
  }

  private handleAuthentication(response: LoginResponse) {
    // Store authentication token
    localStorage.setItem(this.AUTH_TOKEN_KEY, response.token);

    // Store user profile
    const userProfile: UserProfile = {
      id: response.userId,
      username: response.username,
      role: response.role,
    };
    localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(userProfile));

    // Update current user subject and authentication state
    this.currentUserSubject.next(userProfile);
    this.isAuthenticatedSubject.next(true);
  }

  private loadUserFromStorage() {
    const storedToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
    const storedProfile = localStorage.getItem(this.USER_PROFILE_KEY);

    if (storedToken && storedProfile) {
      try {
        const userProfile = JSON.parse(storedProfile);
        // Check if token is valid
        if (!this.isTokenExpired(storedToken)) {
          this.currentUserSubject.next(userProfile);
          this.isAuthenticatedSubject.next(true);
        } else {
          // If token is expired, clear everything
          this.logout();
        }
      } catch (error) {
        this.logout();
      }
    } else {
      // If either token or profile is missing, ensure we're in a logged out state
      this.logout();
    }
  }

  logout() {
    // Clear local storage
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_PROFILE_KEY);

    // Reset current user and authentication state
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  // Handle authentication errors
  handleAuthenticationError(): void {
    console.group('Authentication Error');
    console.warn('Authentication failed. Clearing user session.');
    console.groupEnd();

    // Clear user authentication state
    this.logout();

    // Redirect to login page
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: this.router.url,
        reason: 'session_expired',
      },
    });
  }

  // Get current authentication token
  getAuthToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);

    if (token) {
      const isExpired = this.isTokenExpired(token);

      if (isExpired) {
        console.warn('Token has expired. Clearing session.');
        this.handleAuthenticationError();
        this.isAuthenticatedSubject.next(false);
        return null;
      }

      // Ensure authentication state is synchronized
      if (!this.isAuthenticatedSubject.value) {
        this.isAuthenticatedSubject.next(true);
      }
    } else {
      // No token means not authenticated
      this.isAuthenticatedSubject.next(false);
    }

    return token;
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    try {
      // Decode JWT to check expiration
      const decoded = this.decodeToken(token);

      if (!decoded || !decoded.exp) {
        return true; // Consider token invalid if no expiration
      }

      // Compare current time with token expiration
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return true;
    }
  }

  // Decode JWT token (you might want to use a library like jwt-decode)
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  // Get the current authentication token
  getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  // Get the current user's ID
  getCurrentUserId(): string | null {
    const userProfile = this.getCurrentUser();
    return userProfile?.id || null;
  }

  // Get the current tenant ID (if applicable)
  getTenantId(): string | null {
    const userProfile = this.getCurrentUser();
    return userProfile?.tenantId || null;
  }

  forgotPassword(email: string): Observable<boolean> {
    return this.http
      .post<{ success: boolean }>(
        `${environment.authBaseUrl}/forgot-password`,
        { email }
      )
      .pipe(
        map((response) => response.success),
        catchError((error) => {
          console.error('Password reset error:', error);
          return of(false);
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
