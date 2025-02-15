import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  resetStatus: 'idle' | 'success' | 'error' = 'idle';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      const resetSuccess = this.authService.forgotPassword(email);

      if (resetSuccess) {
        this.resetStatus = 'success';
        // Optional: Add a timeout to redirect or show login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      } else {
        this.resetStatus = 'error';
      }
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
