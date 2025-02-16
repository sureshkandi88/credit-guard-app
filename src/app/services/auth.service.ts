import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { LoginRequest, LoginResponse, UserProfile } from '../models/auth.model';
import { Router } from '@angular/router';

interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  secretQuestion: string;
  secretAnswer: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly AUTH_TOKEN_KEY = 'credit_guard_auth_token';
  private readonly USER_PROFILE_KEY = 'credit_guard_user_profile';

  constructor(
    private http: HttpClient, 
    private router: Router
  ) {
    // Check for existing token and user profile on service initialization
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.authBaseUrl}/login`, credentials).pipe(
      tap((response: LoginResponse) => this.handleAuthentication(response)),
      catchError((error: HttpErrorResponse) => {
        // Log the error and rethrow
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  signup(
    username: string, 
    email: string, 
    password: string, 
    secretQuestion: string,
    secretAnswer: string,
    firstName?: string, 
    lastName?: string
  ): Observable<LoginResponse> {
    const signupRequest: SignupRequest = { 
      username, 
      email, 
      password,
      secretQuestion,
      secretAnswer,
      firstName, 
      lastName 
    };

    return this.http.post<LoginResponse>(`${environment.authBaseUrl}/register`, signupRequest).pipe(
      tap((response: LoginResponse) => this.handleAuthentication(response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Signup error:', error);
        return throwError(() => error);
      })
    );
  }

  private handleAuthentication(response: LoginResponse) {
    // Store authentication token
    localStorage.setItem(this.AUTH_TOKEN_KEY, response.token);

    // Store user profile
    const userProfile: UserProfile = {
      id: response.userId,
      username: response.username,
      role: response.role
    };
    localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(userProfile));

    // Update current user subject
    this.currentUserSubject.next(userProfile);
  }

  private loadUserFromStorage() {
    const storedToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
    const storedProfile = localStorage.getItem(this.USER_PROFILE_KEY);

    if (storedToken && storedProfile) {
      try {
        const userProfile = JSON.parse(storedProfile);
        this.currentUserSubject.next(userProfile);
      } catch (error) {
        this.logout();
      }
    }
  }

  logout() {
    // Clear local storage
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_PROFILE_KEY);

    // Reset current user
    this.currentUserSubject.next(null);

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid username or password';
          break;
        case 403:
          errorMessage = 'You are not authorized to access this resource';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
