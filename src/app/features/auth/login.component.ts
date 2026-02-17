import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <!-- Header -->
        <h1 class="login-title">Sign in</h1>
        <p class="login-subtitle">
          Don't have an account? <a routerLink="/register" class="link">Create an account</a>
        </p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email/ID Field -->
          <div class="form-group">
            <label for="email">Email / ID</label>
            <input
              id="email"
              type="text"
              formControlName="email"
              placeholder="e.g. user@company.com or EMP001"
              class="form-input"
              [class.input-error]="emailControl()?.invalid && (emailControl()?.dirty || emailControl()?.touched)"
              [class.input-focus]="emailFocused()"
              (focus)="emailFocused.set(true)"
              (blur)="emailFocused.set(false)"
            />
            @if (emailControl()?.invalid && (emailControl()?.dirty || emailControl()?.touched)) {
              <span class="error-text">
                @if (emailControl()?.errors?.['required']) {
                  Email or ID is required
                }
              </span>
            }
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="form-input"
              [class.input-error]="passwordControl()?.invalid && (passwordControl()?.dirty || passwordControl()?.touched)"
              [class.input-focus]="passwordFocused()"
              (focus)="passwordFocused.set(true)"
              (blur)="passwordFocused.set(false)"
            />
            @if (passwordControl()?.invalid && (passwordControl()?.dirty || passwordControl()?.touched)) {
              <span class="error-text">
                @if (passwordControl()?.errors?.['required']) {
                  Password is required
                } @else if (passwordControl()?.errors?.['minlength']) {
                  Password must be at least 6 characters
                }
              </span>
            }
          </div>

          <!-- Remember Me & Forgot Password Row -->
          <div class="options-row">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="rememberMe" class="checkbox" />
              <span class="checkbox-text">Remember me</span>
            </label>
            <a routerLink="/forgot-password" class="link">Forgot password?</a>
          </div>

          <!-- Server Error -->
          @if (serverError()) {
            <div class="error-box">{{ serverError() }}</div>
          }

          <!-- Login Button -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading()"
            class="btn-login"
            [class.btn-disabled]="loginForm.invalid || isLoading()"
          >
            @if (isLoading()) {
              Logging in...
            } @else {
              Login
            }
          </button>

          <!-- Divider -->
          <div class="divider">
            <span class="divider-text">OR SIGN IN WITH</span>
          </div>

          <!-- Social Login Buttons -->
          <div class="social-buttons">
            <button type="button" class="btn-social" (click)="signInWithGoogle()">
              <svg class="social-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" class="btn-social" (click)="signInWithFacebook()">
              <svg class="social-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: url('/assets/images/loginbg.jpg') no-repeat center center fixed;
      background-size: cover;
      padding: 20px;
      
    }

    .login-card {
      background: #ffffff6c;
      border-radius: 13px;
      padding: 50px; /* Increased padding */
      width: 100%;
      max-width: 500px; /* Matched to Register page */
      box-shadow: 0 10px 25px rgba(5, 5, 5, 0.1);
    }

    .login-title {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 12px 0;
      text-align: center;
    }

    .login-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 40px 0; /* More space before form */
      text-align: center;
    }

    .link {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 500;
      font-size: 13px;
    }

    .link:hover {
      text-decoration: underline;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 32px; /* Increased gap for height */
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-left: 2px;
    }

    .form-input {
      padding: 12px 16px; /* Comfortable padding */
      border: 1px solid #d1d5db; /* Full border */
      border-radius: 8px; /* Rounded corners */
      font-size: 14px;
      color: #1f2937;
      background: #ffffff;
      transition: all 0.2s;
      width: 100%;
      box-sizing: border-box; /* Ensure padding doesn't break width */
    }

    .form-input::placeholder {
      color: #9ca3af;
    }

    .form-input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); /* Focus ring */
    }

    .form-input.input-error {
      border-color: #ef4444;
    }

    .form-input.input-error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .helper-text {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
      margin-left: 2px;
    }

    .error-text {
      font-size: 12px;
      color: #ef4444;
      margin-top: 4px;
      margin-left: 2px;
    }

    .options-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .checkbox {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: #4f46e5;
      border-radius: 4px;
    }

    .checkbox-text {
      font-size: 13px;
      color: #4b5563;
    }

    .error-box {
      padding: 12px;
      background: #fef2f2;
      border: 1px solid #fee2e2;
      border-radius: 6px;
      color: #b91c1c;
      font-size: 13px;
      text-align: center;
    }

    .btn-login {
      padding: 12px;
      background: #4f46e5; /* Indigo primary */
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .btn-login:hover:not(:disabled) {
      background: #4338ca;
    }

    .btn-login.btn-disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 16px 0;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #e5e7eb;
    }

    .divider-text {
      padding: 0 12px;
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .social-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .btn-social {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-social:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .social-icon {
      flex-shrink: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup;
  isLoading = signal(false);
  serverError = signal<string | null>(null);
  emailFocused = signal(false);
  passwordFocused = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  emailControl() {
    return this.loginForm.get('email');
  }

  passwordControl() {
    return this.loginForm.get('password');
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);

    try {
      const { email, password, rememberMe } = this.loginForm.value;
      const response = await this.authService.login({
        email,
        password,
        rememberMe
      });

      if (response) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Login failed. Please try again.';
      this.serverError.set(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  signInWithGoogle(): void {
    // TODO: Implement Google sign-in
    console.log('Sign in with Google clicked');
  }

  signInWithFacebook(): void {
    // TODO: Implement Facebook sign-in
    console.log('Sign in with Facebook clicked');
  }
}
