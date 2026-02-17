import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(requiredRoles: string[]): boolean {
    const currentUser = this.authService.user();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasRole = requiredRoles.some(role =>
      this.authService.hasRole(role)
    );

    if (!hasRole) {
      this.router.navigate(['/access-denied']);
      return false;
    }

    return true;
  }
}
