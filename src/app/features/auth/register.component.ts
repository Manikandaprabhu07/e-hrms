import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-box">
        <div class="register-header">
          <h1>Create Account</h1>
          <p>Join E-HRMS and manage your HR needs efficiently</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <!-- First Name -->
          <div class="form-group">
            <label for="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              formControlName="firstName"
              class="form-control"
              placeholder="Enter your first name"
              [disabled]="isLoading()"
            />
            <span class="error-message" *ngIf="registerForm.get('firstName')?.hasError('required') && registerForm.get('firstName')?.touched">
              First name is required
            </span>
          </div>

          <!-- Last Name -->
          <div class="form-group">
            <label for="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              formControlName="lastName"
              class="form-control"
              placeholder="Enter your last name"
              [disabled]="isLoading()"
            />
            <span class="error-message" *ngIf="registerForm.get('lastName')?.hasError('required') && registerForm.get('lastName')?.touched">
              Last name is required
            </span>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Email Address *</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              placeholder="Enter your email address"
              [disabled]="isLoading()"
            />
            <span class="error-message" *ngIf="registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched">
              Email is required
            </span>
            <span class="error-message" *ngIf="registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched">
              Please enter a valid email address
            </span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Password *</label>
            <div class="password-input-wrapper">
              <input
                [type]="passwordVisible ? 'text' : 'password'"
                id="password"
                formControlName="password"
                class="form-control"
                placeholder="Enter a password (min 8 characters)"
                [disabled]="isLoading()"
              />
              <button
                type="button"
                class="toggle-password"
                (click)="togglePasswordVisibility()"
                [disabled]="isLoading()"
              >
                {{ passwordVisible ? 'Hide' : 'Show' }}
              </button>
            </div>
            <span class="error-message" *ngIf="registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched">
              Password is required
            </span>
            <span class="error-message" *ngIf="registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched">
              Password must be at least 8 characters
            </span>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirmPassword">Confirm Password *</label>
            <div class="password-input-wrapper">
              <input
                [type]="confirmPasswordVisible ? 'text' : 'password'"
                id="confirmPassword"
                formControlName="confirmPassword"
                class="form-control"
                placeholder="Confirm your password"
                [disabled]="isLoading()"
              />
              <button
                type="button"
                class="toggle-password"
                (click)="toggleConfirmPasswordVisibility()"
                [disabled]="isLoading()"
              >
                {{ confirmPasswordVisible ? 'Hide' : 'Show' }}
              </button>
            </div>
            <span class="error-message" *ngIf="registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched">
              Please confirm your password
            </span>
            <span class="error-message" *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
              Passwords do not match
            </span>
          </div>

          <!-- Terms & Conditions -->
          <div class="form-group checkbox">
            <input
              type="checkbox"
              id="termsAccepted"
              formControlName="termsAccepted"
              [disabled]="isLoading()"
            />
            <label for="termsAccepted">
              I agree to the
              <a href="#" target="_blank">Terms and Conditions</a>
              *
            </label>
            <span class="error-message" *ngIf="registerForm.get('termsAccepted')?.hasError('required') && registerForm.get('termsAccepted')?.touched">
              You must accept the terms and conditions
            </span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-submit"
            [disabled]="registerForm.invalid || isLoading()"
          >
            {{ isLoading() ? 'Creating Account...' : 'Create Account' }}
          </button>

          <!-- Error Message -->
          <div class="error-alert" *ngIf="errorMessage()">
            <span>⚠️ {{ errorMessage() }}</span>
          </div>
        </form>

        <!-- Login Link -->
        <div class="login-link">
          <p>Already have an account? <a routerLink="/login">Sign in here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: url('/assets/images/loginbg.jpg') no-repeat center center fixed;
      background-size: cover;
      padding: 20px;
    }

    .register-box {
      background: #ffffff6c;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 48px;
      max-width: 500px;
      width: 100%;
    }

    .register-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .register-header h1 {
      color: #1f2937;
      font-size: 26px;
      margin: 0 0 10px 0;
      font-weight: 700;
    }

    .register-header p {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
      font-size: 13px;
      margin-left: 2px;
    }

    .form-control {
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      color: #1f2937;
      transition: all 0.2s;
      width: 100%;
      box-sizing: border-box;
    }

    .form-control::placeholder {
      color: #9ca3af;
    }

    .form-control:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .form-control:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
      color: #9ca3af;
    }

    .password-input-wrapper {
      display: flex;
      gap: 8px;
      align-items: center;
      position: relative;
    }

    .password-input-wrapper .form-control {
      padding-right: 80px; /* Space for button */
    }

    .toggle-password {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      padding: 6px 12px;
      background: transparent;
      border: none;
      color: #4f46e5;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: color 0.2s;
    }

    .toggle-password:hover:not(:disabled) {
      color: #4338ca;
      background: transparent;
    }

    .form-group.checkbox {
      flex-direction: row;
      align-items: center;
      gap: 10px;
      margin-top: 5px;
    }

    .form-group.checkbox input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: #4f46e5;
      border-radius: 4px;
    }

    .form-group.checkbox label {
      margin: 0;
      font-weight: 500;
      font-size: 13px;
      color: #4b5563;
    }

    .form-group.checkbox a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
    }

    .form-group.checkbox a:hover {
      text-decoration: underline;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 2px;
      margin-left: 2px;
    }

    .error-alert {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      color: #b91c1c;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
    }

    .btn-submit {
      padding: 12px;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 10px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .btn-submit:hover:not(:disabled) {
      background: #4338ca;
    }

    .btn-submit:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .login-link {
      text-align: center;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .login-link p {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }

    .login-link a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .register-box {
        padding: 30px 20px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  registerForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        termsAccepted: [false, Validators.requiredTrue]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.notificationService.error('Please fill in all required fields correctly');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const user = await this.authService.register(this.registerForm.value);
      this.notificationService.success('Account created successfully! Redirecting to login...');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      const message = error.error?.message || 'Registration failed. Please try again.';
      this.errorMessage.set(message);
      this.notificationService.error(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
