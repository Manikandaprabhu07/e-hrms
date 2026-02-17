import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { UserMenuComponent } from './user-menu.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, UserMenuComponent],
  template: `
    <div class="layout-wrapper">
      <app-sidebar (collapsedChange)="onSidebarCollapse($event)"></app-sidebar>
      <div class="main-container" [class.sidebar-collapsed]="isSidebarCollapsed()">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search employees, documents..." class="search-input" />
            </div>
          </div>
          <div class="header-right">
            <button class="notification-btn">
              <span class="notification-icon">🔔</span>
              <span class="notification-badge">3</span>
            </button>
            <app-user-menu></app-user-menu>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background: transparent;
    }

    .main-container {
      flex: 1;
      margin-left: 240px;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.3s ease;
      width: calc(100% - 240px); /* Explicit width to prevent blank space */
    }

    .main-container.sidebar-collapsed {
      margin-left: 70px;
      width: calc(100% - 70px);
    }

    .top-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: rgba(175, 115, 30, 0.33);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border-bottom: 1px solid rgba(229, 231, 235, 0.44);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      flex: 1;
      max-width: 500px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(243, 244, 246, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 10px 16px;
    }

    .search-icon {
      font-size: 16px;
      opacity: 0.6;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 14px;
      color: #374151;
      outline: none;
    }

    .search-input::placeholder {
      color: #9ca3af;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .notification-btn {
      position: relative;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .notification-btn:hover {
      background: #f3f4f6;
    }

    .notification-icon {
      font-size: 20px;
    }

    .notification-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 18px;
      height: 18px;
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: 600;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main-content {
      flex: 1;
      padding: 24px;
      overflow: hidden; /* Disable page scroll, let components handle it */
      width: 100%;
    }

    @media (max-width: 768px) {
      .main-container {
        margin-left: 70px;
      }

      .search-box {
        display: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  isSidebarCollapsed = signal(false);

  onSidebarCollapse(collapsed: boolean): void {
    this.isSidebarCollapsed.set(collapsed);
  }
}
