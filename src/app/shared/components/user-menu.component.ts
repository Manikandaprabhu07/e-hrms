import { Component, inject, HostListener, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="user-menu-container">
      <button class="user-menu-btn" (click)="toggleMenu()" type="button" aria-label="User menu">
        <!-- Carbon User Profile Icon -->
        <svg class="icon" viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
          <path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 6c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm0 18c-3.4 0-6.5-1.8-8.2-4.5C9.1 19.2 12.3 18 16 18s6.9 1.2 8.2 3.5C22.5 24.2 19.4 26 16 26z"/>
        </svg>
        
        <span class="user-name">{{ user()?.firstName || 'User' }}</span>
        
        <!-- Carbon Chevron Down Icon -->
        <svg class="dropdown-arrow" [class.open]="isOpen()" viewBox="0 0 32 32" width="16" height="16" fill="currentColor">
          <path d="M16 22L6 12h20z"/>
        </svg>
      </button>

      <div class="dropdown-menu" [class.open]="isOpen()">
        <div class="menu-header">
          <p class="email">{{ user()?.email }}</p>
        </div>

        <nav class="menu-items">
          <a routerLink="/account-settings" (click)="onMenuItemClick()" class="menu-item">
            <!-- Carbon Settings Icon -->
            <svg class="icon" viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
              <path d="M28.06 19.56L26.5 17.1a9.66 9.66 0 00.12-1.1 9.66 9.66 0 00-.12-1.1l1.56-2.46a.9.9 0 00.22-1.06l-1.48-2.56a.9.9 0 00-1.06-.22l-1.84.74a10 10 0 00-1.9-1.1l-.28-1.96a.9.9 0 00-.88-.76h-2.96a.9.9 0 00-.88.76l-.28 1.96a10 10 0 00-1.9 1.1l-1.84-.74a.9.9 0 00-1.06.22l-1.48 2.56a.9.9 0 00.22 1.06l1.56 2.46a9.66 9.66 0 00-.12 1.1 9.66 9.66 0 00.12 1.1l-1.56 2.46a.9.9 0 00-.22 1.06l1.48 2.56a.9.9 0 001.06.22l1.84-.74a10 10 0 001.9 1.1l.28 1.96a.9.9 0 00.88.76h2.96a.9.9 0 00.88-.76l.28-1.96a10 10 0 001.9-1.1l1.84.74a.9.9 0 001.06-.22l1.48-2.56a.9.9 0 00-.22-1.06zM16 21a5 5 0 115-5 5 5 0 01-5 5z"/>
            </svg>
            Account Settings
          </a>
          <button type="button" (click)="logout()" class="menu-item logout-btn">
            <!-- Carbon Logout Icon -->
            <svg class="icon" viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
              <path d="M18 2h-4a2 2 0 00-2 2v6h2V4h4v24h-4v-6h-2v6a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2z"/>
              <path d="M7.71 15.71L6 14 10 10h-8v2h8l-4 4 1.71 1.71L14 14l-6.29-6.29z"/>
            </svg>
            Logout
          </button>
        </nav>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cds-ui-01: #f4f4f4;
      --cds-ui-02: #ffffff;
      --cds-ui-03: #e0e0e0;
      --cds-text-01: #161616;
      --cds-text-02: #525252;
      --cds-interactive-01: #0f62fe;
      --cds-danger: #da1e28;
    }

    .user-menu-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid var(--cds-ui-03);
      border-radius: 2px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
      color: var(--cds-text-01);
      z-index: 1001;
      position: relative;
      font-family: 'IBM Plex Sans', Arial, sans-serif;
    }

    .user-menu-btn:hover {
      background: var(--cds-ui-01);
      border-color: var(--cds-interactive-01);
    }

    .icon {
      flex-shrink: 0;
      color: var(--cds-text-02);
    }

    .user-name {
      font-weight: 500;
      display: none;
      margin: 0 0.5rem;
      font-size: 0.875rem;
    }

    @media (min-width: 768px) {
      .user-name {
        display: inline;
      }
    }

    .dropdown-arrow {
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .dropdown-arrow.open {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--cds-ui-02);
      border: 1px solid var(--cds-ui-03);
      border-radius: 2px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      min-width: 240px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s;
      z-index: 1000;
      pointer-events: none;
    }

    .dropdown-menu.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      pointer-events: auto;
    }

    .menu-header {
      padding: 1rem;
      border-bottom: 1px solid var(--cds-ui-03);
    }

    .email {
      margin: 0;
      font-size: 0.75rem;
      color: var(--cds-text-02);
      word-break: break-all;
      font-family: 'IBM Plex Sans', Arial, sans-serif;
    }

    .menu-items {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: none;
      color: var(--cds-text-01);
      transition: background-color 0.2s;
      text-align: left;
      width: 100%;
      font-size: 0.875rem;
      font-family: 'IBM Plex Sans', Arial, sans-serif;
    }

    .menu-item:hover {
      background-color: var(--cds-ui-01);
    }

    .logout-btn {
      color: var(--cds-danger);
      border-top: 1px solid var(--cds-ui-03);
    }

    .logout-btn:hover {
      background-color: #fae6e6;
    }

    .logout-btn .icon {
      color: var(--cds-danger);
    }
  `]
})
export class UserMenuComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  user = this.authService.user;
  isOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isOpen.set(false);
    }
  }

  toggleMenu(): void {
    this.isOpen.update(value => !value);
  }

  onMenuItemClick(): void {
    this.isOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
