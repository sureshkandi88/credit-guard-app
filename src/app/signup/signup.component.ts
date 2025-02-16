import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class SignupComponent {
  signupForm: FormGroup;
  signupStatus: 'idle' | 'success' | 'error' = 'idle';
  errorMessage: string = '';

  // Predefined list of secret questions
  secretQuestions: string[] = [
    'What was the name of your first pet?',
    'In what city were you born?',
    'What is your mother\'s maiden name?',
    'What was the name of your elementary school?',
    'What is your favorite childhood movie?'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(4),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      firstName: ['', [
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8)
      ]],
      confirmPassword: ['', Validators.required],
      secretQuestion: ['', Validators.required],
      secretAnswer: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    this.signupStatus = 'idle';
    this.errorMessage = '';

    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName,
      secretQuestion,
      secretAnswer
    } = this.signupForm.value;

    this.authService.signup(
      username, 
      email, 
      password, 
      secretQuestion,
      secretAnswer,
      firstName || undefined, 
      lastName || undefined
    ).subscribe({
      next: (response) => {
        this.signupStatus = 'success';
        // Optional: Add a timeout to redirect or show success message
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.signupStatus = 'error';
        this.errorMessage = error.error?.message || 'An unexpected error occurred during signup';
        console.error('Signup error:', error);
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
