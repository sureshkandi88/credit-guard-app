import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  // Simulated user database
  private users: { username: string, email: string, password: string }[] = [];

  constructor(private router: Router) {
    // Check if user is already logged in (e.g., from local storage)
    const token = localStorage.getItem('authToken');
    this.isAuthenticatedSubject.next(!!token);
  }

  login(username: string, password: string): boolean {
    // Simplified login logic - replace with actual authentication
    if (username === 'admin' && password === 'password') {
      const token = 'dummy-auth-token';
      localStorage.setItem('authToken', token);
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  forgotPassword(email: string): boolean {
    // Simulated forgot password logic
    // In a real-world scenario, this would trigger an email with reset instructions
    const userExists = this.users.some(user => user.email === email);
    
    if (userExists) {
      // Simulate sending a password reset email
      console.log(`Password reset instructions sent to ${email}`);
      return true;
    }
    return false;
  }

  signup(username: string, email: string, password: string): boolean {
    // Check if username or email already exists
    const usernameExists = this.users.some(user => user.username === username);
    const emailExists = this.users.some(user => user.email === email);

    if (usernameExists || emailExists) {
      return false;
    }

    // Add new user to the simulated database
    this.users.push({ username, email, password });
    console.log('User registered:', username, email);
    return true;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
