import { Component, ChangeDetectionStrategy, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Array<'ADMIN' | 'EMPLOYEE'>;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed()">
      <!-- Logo Section -->
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="sidebarLogoBg" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#f472b6" />
                  <stop offset="0.55" stop-color="#8b5cf6" />
                  <stop offset="1" stop-color="#38bdf8" />
                </linearGradient>
              </defs>
              <rect x="4" y="4" width="40" height="40" rx="14" fill="url(#sidebarLogoBg)" />
              <path d="M14 31V17.5C14 16.67 14.67 16 15.5 16H18.5C19.33 16 20 16.67 20 17.5V31C20 31.83 19.33 32.5 18.5 32.5H15.5C14.67 32.5 14 31.83 14 31Z" fill="white" fill-opacity="0.96"/>
              <path d="M22.5 31V12.5C22.5 11.67 23.17 11 24 11H27C27.83 11 28.5 11.67 28.5 12.5V31C28.5 31.83 27.83 32.5 27 32.5H24C23.17 32.5 22.5 31.83 22.5 31Z" fill="white" fill-opacity="0.9"/>
              <path d="M31 31V22C31 21.17 31.67 20.5 32.5 20.5H35.5C36.33 20.5 37 21.17 37 22V31C37 31.83 36.33 32.5 35.5 32.5H32.5C31.67 32.5 31 31.83 31 31Z" fill="white" fill-opacity="0.82"/>
              <path d="M13 35.5H35" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.72"/>
            </svg>
          </span>
          @if (!isCollapsed()) {
            <span class="logo-text">E-HRMS</span>
          }
        </div>
        <!-- Hamburger Menu Button -->
        <button class="menu-btn" (click)="toggleCollapse()" [title]="isCollapsed() ? 'Expand menu' : 'Collapse menu'">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            @if (isCollapsed()) {
              <!-- Menu icon (hamburger) -->
              <rect x="2" y="4" width="16" height="2" rx="1"/>
              <rect x="2" y="9" width="16" height="2" rx="1"/>
              <rect x="2" y="14" width="16" height="2" rx="1"/>
            } @else {
              <!-- Close/collapse icon -->
              <rect x="2" y="4" width="16" height="2" rx="1"/>
              <rect x="2" y="9" width="16" height="2" rx="1"/>
              <rect x="2" y="14" width="16" height="2" rx="1"/>
            }
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          @for (item of navItems; track item.route) {
            @if (canShow(item)) {
              <li class="nav-item">
                @if (item.children?.length) {
                  <button class="nav-link nav-parent" type="button" (click)="toggleSection(item.route)" [title]="item.label">
                    <span class="nav-icon" [ngClass]="getIconTone(item.route)">{{ item.icon }}</span>
                    @if (!isCollapsed()) {
                      <span class="nav-label">{{ item.label }}</span>
                      <span class="nav-caret">{{ isSectionExpanded(item.route) ? '▾' : '▸' }}</span>
                    }
                  </button>

                  @if (!isCollapsed() && isSectionExpanded(item.route)) {
                    <ul class="subnav-list">
                      @for (child of item.children || []; track child.route) {
                        @if (canShow(child)) {
                          <li class="subnav-item">
                            <a
                              [routerLink]="child.route"
                              routerLinkActive="active"
                              [routerLinkActiveOptions]="{ exact: child.route === '/hr' }"
                              class="nav-link subnav-link"
                              [title]="child.label"
                            >
                              <span class="nav-icon" [ngClass]="getIconTone(child.route)">{{ child.icon }}</span>
                              <span class="nav-label">{{ child.label }}</span>
                            </a>
                          </li>
                        }
                      }
                    </ul>
                  }
                } @else {
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="active"
                    [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                    class="nav-link"
                    [title]="item.label"
                  >
                    <span class="nav-icon" [ngClass]="getIconTone(item.route)">{{ item.icon }}</span>
                    @if (!isCollapsed()) {
                      <span class="nav-label">{{ item.label }}</span>
                    }
                  </a>
                }
              </li>
            }
          }
        </ul>
      </nav>

      <!-- Bottom Section -->
      <div class="sidebar-footer">
        <ul class="nav-list">
          <li class="nav-item">
            <a routerLink="/account-settings" routerLinkActive="active" class="nav-link" title="Settings">
              <span class="nav-icon icon-tone-settings">⚙</span>
              @if (!isCollapsed()) {
                <span class="nav-label">Settings</span>
              }
            </a>
          </li>
          <li class="nav-item">
            <button (click)="logout()" class="nav-link logout-btn" title="Logout">
              <span class="nav-icon icon-tone-logout">⇥</span>
              @if (!isCollapsed()) {
                <span class="nav-label">Logout</span>
              }
            </button>
          </li>
        </ul>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      height: 100vh;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      border-right: 1px solid rgba(148, 163, 184, 0.25);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
    }

    .logo-icon {
      flex-shrink: 0;
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      overflow: hidden;
      box-shadow:
        0 16px 30px rgba(56, 189, 248, 0.18),
        0 8px 18px rgba(244, 114, 182, 0.22);
    }

    .logo-icon svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .menu-btn {
      background: rgba(255, 255, 255, 0.12);
      border: none;
      color: rgba(255, 255, 255, 0.9);
      width: 36px;
      height: 36px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.2s;
      flex-shrink: 0;
    }

    .menu-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin: 4px 12px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      border: none;
      background: transparent;
      text-align: left;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.12);
      color: white;
    }

    .nav-link.active {
      background: rgba(59, 130, 246, 0.22);
      color: white;
      box-shadow: 0 10px 20px rgba(59, 130, 246, 0.18);
    }

    .nav-parent {
      justify-content: space-between;
    }

    .nav-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 11px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: rgba(255, 255, 255, 0.96);
      text-align: center;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(59, 130, 246, 0.88));
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.14),
        0 10px 18px rgba(15, 23, 42, 0.3);
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-caret {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.75);
    }

    .subnav-list {
      list-style: none;
      margin: 6px 0 0 0;
      padding: 0 0 0 14px;
    }

    .subnav-item {
      margin: 4px 0;
    }

    .subnav-link {
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.26);
    }

    .subnav-link .nav-icon {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }

    .icon-tone-workspace { background: linear-gradient(135deg, #f472b6, #8b5cf6 55%, #38bdf8); }
    .icon-tone-overview { background: linear-gradient(135deg, #60a5fa, #2563eb); }
    .icon-tone-recruitment { background: linear-gradient(135deg, #fb7185, #f97316); }
    .icon-tone-lifecycle { background: linear-gradient(135deg, #22c55e, #14b8a6); }
    .icon-tone-reports { background: linear-gradient(135deg, #a78bfa, #6366f1); }
    .icon-tone-shifts { background: linear-gradient(135deg, #38bdf8, #0ea5e9); }
    .icon-tone-expenses { background: linear-gradient(135deg, #f59e0b, #f97316); }
    .icon-tone-dashboard { background: linear-gradient(135deg, #60a5fa, #2563eb); }
    .icon-tone-employees { background: linear-gradient(135deg, #8b5cf6, #6366f1); }
    .icon-tone-leave { background: linear-gradient(135deg, #14b8a6, #22c55e); }
    .icon-tone-attendance { background: linear-gradient(135deg, #10b981, #059669); }
    .icon-tone-payroll { background: linear-gradient(135deg, #f59e0b, #ef4444); }
    .icon-tone-training { background: linear-gradient(135deg, #06b6d4, #3b82f6); }
    .icon-tone-feedback { background: linear-gradient(135deg, #ec4899, #8b5cf6); }
    .icon-tone-settings { background: linear-gradient(135deg, #64748b, #475569); }
    .icon-tone-logout { background: linear-gradient(135deg, #f97316, #ef4444); }

    .sidebar-footer {
      padding: 16px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logout-btn {
      width: 100%;
    }

    .sidebar.collapsed .sidebar-header {
      padding: 16px 8px;
      justify-content: center;
    }

    .sidebar.collapsed .logo {
      display: none;
    }

    .sidebar.collapsed .nav-item {
      margin: 4px 8px;
    }

    .sidebar.collapsed .nav-link {
      justify-content: center;
      padding: 12px;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 70px;
      }

      .logo-text,
      .nav-label {
        display: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = signal(false);
  expandedSections = signal<Record<string, boolean>>({ '/hr': false });
  @Output() collapsedChange = new EventEmitter<boolean>();

  navItems: NavItem[] = [
    {
      label: 'Workspace',
      icon: '✦',
      route: '/hr',
      roles: ['ADMIN', 'EMPLOYEE'],
      children: [
        { label: 'Overview', icon: '◎', route: '/hr', roles: ['ADMIN', 'EMPLOYEE'] },
        { label: 'Recruitment', icon: '◉', route: '/hr/recruitment', roles: ['ADMIN'] },
        { label: 'Lifecycle', icon: '↺', route: '/hr/lifecycle', roles: ['ADMIN'] },
        { label: 'Reports', icon: '▥', route: '/hr/reports', roles: ['ADMIN'] },
        { label: 'Shifts', icon: '◷', route: '/hr/shifts', roles: ['ADMIN', 'EMPLOYEE'] },
        { label: 'Expenses', icon: '₹', route: '/hr/expenses', roles: ['ADMIN', 'EMPLOYEE'] },
      ],
    },
    { label: 'Dashboard', icon: '◫', route: '/dashboard' },
    { label: 'Employee Management', icon: '◌', route: '/employees' },
    { label: 'Leave Management', icon: '☰', route: '/leave' },
    { label: 'Attendance', icon: '✓', route: '/attendance' },
    { label: 'Payroll', icon: '₹', route: '/payroll' },
    { label: 'Training', icon: '▲', route: '/training' },
    { label: 'Feedback', icon: '✉', route: '/feedback', roles: ['ADMIN'] },
  ];

  canShow(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some((r) => this.authService.hasRole(r));
  }

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
    this.collapsedChange.emit(this.isCollapsed());
  }

  toggleSection(route: string): void {
    if (this.isCollapsed()) {
      this.isCollapsed.set(false);
      this.collapsedChange.emit(false);
    }

    this.expandedSections.update((sections) => ({
      ...sections,
      [route]: !sections[route],
    }));
  }

  isSectionExpanded(route: string): boolean {
    return !!this.expandedSections()[route];
  }

  getIconTone(route: string): string {
    if (route === '/hr') return 'icon-tone-workspace';
    if (route === '/hr/recruitment') return 'icon-tone-recruitment';
    if (route === '/hr/lifecycle') return 'icon-tone-lifecycle';
    if (route === '/hr/reports') return 'icon-tone-reports';
    if (route === '/hr/shifts') return 'icon-tone-shifts';
    if (route === '/hr/expenses') return 'icon-tone-expenses';
    if (route === '/dashboard') return 'icon-tone-dashboard';
    if (route === '/employees') return 'icon-tone-employees';
    if (route === '/leave') return 'icon-tone-leave';
    if (route === '/attendance') return 'icon-tone-attendance';
    if (route === '/payroll') return 'icon-tone-payroll';
    if (route === '/training') return 'icon-tone-training';
    if (route === '/feedback') return 'icon-tone-feedback';
    return 'icon-tone-overview';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

