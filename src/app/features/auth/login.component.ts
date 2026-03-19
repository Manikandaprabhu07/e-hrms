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
      <div class="login-container">
        <aside class="brand-panel">
          <div class="brand-header">
            <div class="brand-logo">E‑HRMS</div>
            <div class="brand-subtitle">Smarter HR for modern teams</div>
          </div>

          <div class="brand-body">
            <h2>Welcome back!</h2>
            <p>Sign in to access your company dashboard, manage teams, and track attendance.</p>
            <ul class="features">
              <li>✅ Secure single sign-on</li>
              <li>✅ Real-time analytics</li>
              <li>✅ Team & leave management</li>
            </ul>
          </div>

          <div class="brand-footer">
            Need help? <a href="mailto:support@company.com">support@company.com</a>
          </div>
        </aside>

        <section class="form-panel">
          <div class="form-panel-inner">
            <h1 class="login-title">Sign in</h1>
            <p class="login-subtitle">Enter your credentials to access your dashboard.</p>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="email">Email / ID</label>
                <input
                  id="email"
                  type="text"
                  formControlName="email"
                  placeholder="e.g. user@company.com or EMP001"
                  class="form-input"
                  [class.input-error]="emailControl()?.invalid && (emailControl()?.dirty || emailControl()?.touched)"
                />
                @if (emailControl()?.invalid && (emailControl()?.dirty || emailControl()?.touched)) {
                  <span class="error-text">
                    @if (emailControl()?.errors?.['required']) {
                      Email or ID is required
                    }
                  </span>
                }
              </div>

              <div class="form-group password-group">
                <label for="password">Password</label>
                <div class="password-wrapper">
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="••••••••"
                    class="form-input"
                    [class.input-error]="passwordControl()?.invalid && (passwordControl()?.dirty || passwordControl()?.touched)"
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    (click)="togglePassword()"
                    aria-label="Toggle password visibility"
                  >
                    @if (showPassword()) {
                      Hide
                    } @else {
                      Show
                    }
                  </button>
                </div>
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

              <div class="options-row">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="rememberMe" class="checkbox" />
                  <span class="checkbox-text">Remember me</span>
                </label>
                <a routerLink="/forgot-password" class="link">Forgot password?</a>
              </div>

              @if (serverError()) {
                <div class="error-box">{{ serverError() }}</div>
              }

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
            </form>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 65%, #e2e8f0 100%);
    }

    .login-container {
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      width: min(1040px, 100%);
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
    }

    .brand-panel {
      background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
      color: rgba(255, 255, 255, 0.9);
      padding: 42px 36px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .brand-header {
      margin-bottom: 28px;
    }

    .brand-logo {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 0.04em;
      margin-bottom: 12px;
    }

    .brand-subtitle {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.85;
    }

    .brand-body h2 {
      margin: 0 0 12px 0;
      font-size: 26px;
      font-weight: 800;
    }

    .brand-body p {
      margin: 0 0 18px 0;
      opacity: 0.8;
      line-height: 1.5;
    }

    .features {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 10px;
      font-size: 14px;
      opacity: 0.85;
    }

    .features li {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-footer {
      font-size: 12px;
      opacity: 0.75;
    }

    .brand-footer a {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: underline;
    }

    .form-panel {
      background: #ffffff;
      padding: 42px 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-panel-inner {
      width: 100%;
      max-width: 360px;
    }

    .login-title {
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 10px 0;
      text-align: left;
      color: #0f172a;
    }

    .login-subtitle {
      font-size: 14px;
      color: #475569;
      margin: 0 0 28px 0;
      line-height: 1.6;
    }

    .link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
    }

    .link:hover {
      text-decoration: underline;
    }

    .btn-login {
      padding: 12px;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      width: 100%;
      margin-top: 12px;
    }

    .btn-login:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 20px rgba(79, 70, 229, 0.25);
    }

    .btn-disabled {
      opacity: 0.55;
      pointer-events: none;
    }

    @media (max-width: 920px) {
      .login-container {
        grid-template-columns: 1fr;
      }

      .brand-panel {
        display: none;
      }

      .form-panel {
        padding: 38px 32px;
      }
    }

    .login-title {
      font-size: 28px;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0 0 12px 0;
      text-align: center;
    }

    .login-subtitle {
      font-size: 14px;
      color: #1e3a8a;
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
      color: rgba(248, 250, 252, 0.85);
      margin-left: 2px;
    }

    .form-input {
      padding: 12px 16px; /* Comfortable padding */
      border: 1px solid rgba(255, 255, 255, 0.3); /* Light border */
      border-radius: 8px; /* Rounded corners */
      font-size: 14px;
      color: #0f172a;
      background: rgba(255, 255, 255, 0.9);
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

    .password-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    .password-toggle {
      appearance: none;
      border: none;
      background: transparent;
      color: #4f46e5;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 8px;
      transition: background 0.18s ease;
    }

    .password-toggle:hover {
      background: rgba(79, 70, 229, 0.1);
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
  showPassword = signal(false);

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

  togglePassword(): void {
    this.showPassword.update((v) => !v);
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
