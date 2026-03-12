import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { UserMenuComponent } from './user-menu.component';
import { ChatbarComponent } from './chatbar.component';
import { ChatbarService, EmployeeService } from '../../core/services';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, SidebarComponent, UserMenuComponent, ChatbarComponent],
  template: `
    <div class="layout-wrapper">
      <app-sidebar (collapsedChange)="onSidebarCollapse($event)"></app-sidebar>
      <div class="main-container" [class.sidebar-collapsed]="isSidebarCollapsed()">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search employees, payroll, training..."
                class="search-input"
                [ngModel]="searchText()"
                (ngModelChange)="onSearchInput($event)"
                (focus)="searchOpen.set(true); onSearchChange()"
                (blur)="onSearchBlur()"
              />
            </div>

            @if (searchOpen() && normalizedSearch().length > 0) {
              <div class="search-popover">
                @if (isSearching()) {
                  <div class="search-empty">Searching...</div>
                } @else if (searchResults().length === 0) {
                  <div class="search-empty">No data found</div>
                } @else {
                  @for (r of searchResults(); track r.key) {
                    <button class="search-item" (mousedown)="goSearch(r)">
                      <div class="s-title">{{ r.title }}</div>
                      <div class="s-meta">{{ r.meta }}</div>
                    </button>
                  }
                }
              </div>
            }
          </div>
          <div class="header-right">
            <button class="notification-btn" (click)="toggleChatbar()">
              <span class="notification-icon">🔔</span>
              @if (badgeCount() > 0) {
                <span class="notification-badge">{{ badgeCount() }}</span>
              }
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
    <app-chatbar></app-chatbar>
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

    .search-popover {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      width: min(520px, calc(100vw - 130px));
      background: rgba(255,255,255,0.96);
      border: 1px solid rgba(226,232,240,0.9);
      border-radius: 12px;
      box-shadow: 0 18px 40px rgba(0,0,0,0.12);
      padding: 8px;
      z-index: 200;
    }

    .header-left { position: relative; }

    .search-item {
      width: 100%;
      text-align: left;
      border: 1px solid transparent;
      background: transparent;
      padding: 10px 10px;
      border-radius: 10px;
      cursor: pointer;
    }
    .search-item:hover {
      border-color: rgba(37,99,235,0.25);
      background: rgba(37,99,235,0.06);
    }
    .s-title { font-weight: 900; color: #0f172a; font-size: 13px; }
    .s-meta { font-weight: 700; color: #64748b; font-size: 12px; margin-top: 2px; }

    .search-empty {
      padding: 10px 10px;
      color: #64748b;
      font-weight: 800;
      font-size: 12px;
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
  private chatbarService = inject(ChatbarService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  isSidebarCollapsed = signal(false);

  // search
  searchText = signal('');
  searchOpen = signal(false);
  searchResults = signal<Array<{ key: string; title: string; meta: string; route: any[] }>>([]);
  isSearching = signal(false);
  normalizedSearch = computed(() => String(this.searchText() || '').trim());
  private searchTimer: any = null;
  private employeesLoaded = false;

  badgeCount = computed(() => {
    const ov = this.chatbarService.overview();
    return (ov?.unreadNotifications || 0) + (ov?.unreadMessages || 0);
  });

  constructor() {
    void this.chatbarService.loadOverview();
    setInterval(() => void this.chatbarService.loadOverview(), 15000);
  }

  onSidebarCollapse(collapsed: boolean): void {
    this.isSidebarCollapsed.set(collapsed);
  }

  toggleChatbar(): void {
    this.chatbarService.toggle();
    void this.chatbarService.loadOverview();
  }

  onSearchBlur(): void {
    // allow click on results (mousedown) before closing
    setTimeout(() => this.searchOpen.set(false), 120);
  }

  onSearchInput(next: string): void {
    this.searchText.set(next);
    this.searchOpen.set(true);
    this.onSearchChange();
  }

  onSearchChange(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.isSearching.set(true);
    this.searchTimer = setTimeout(() => void this.recomputeSearch(), 160);
  }

  private async recomputeSearch(): Promise<void> {
    const q = this.normalizedSearch().toLowerCase();
    if (!q) {
      this.searchResults.set([]);
      this.isSearching.set(false);
      return;
    }

    if (!this.employeesLoaded && q.length >= 2) {
      try {
        await this.employeeService.getEmployees({ pageNumber: 1, pageSize: 5000 });
        this.employeesLoaded = true;
      } catch {
        // ignore
      }
    }

    const routes: Array<{ key: string; title: string; meta: string; route: any[]; tokens: string[] }> = [
      { key: 'route-dashboard', title: 'Dashboard', meta: 'Go to Dashboard', route: ['/dashboard'], tokens: ['dashboard', 'home'] },
      { key: 'route-employees', title: 'Employees', meta: 'Employee list', route: ['/employees'], tokens: ['employee', 'employees', 'staff'] },
      { key: 'route-leave', title: 'Leave', meta: 'Leave management', route: ['/leave'], tokens: ['leave', 'leaves', 'request'] },
      { key: 'route-attendance', title: 'Attendance', meta: 'Attendance records', route: ['/attendance'], tokens: ['attendance', 'present', 'absent'] },
      { key: 'route-payroll', title: 'Payroll', meta: 'Payslips & payroll', route: ['/payroll'], tokens: ['payroll', 'payslip', 'salary'] },
      { key: 'route-training', title: 'Training', meta: 'Training sessions', route: ['/training'], tokens: ['training', 'course', 'development'] },
      { key: 'route-feedback', title: 'Feedback', meta: 'Admin feedback inbox', route: ['/feedback'], tokens: ['feedback', 'suggestion', 'complaint'] },
      { key: 'route-settings', title: 'Settings', meta: 'Account settings', route: ['/account-settings'], tokens: ['settings', 'account'] },
    ];

    const routeMatches = routes
      .filter((r) => r.title.toLowerCase().includes(q) || r.tokens.some((t) => t.includes(q) || q.includes(t)))
      .slice(0, 6)
      .map((r) => ({ key: r.key, title: r.title, meta: r.meta, route: r.route }));

    const employees = (this.employeeService.employees() || []) as any[];
    const empMatches = employees
      .filter((e) => {
        const name = `${e.firstName || ''} ${e.lastName || ''}`.trim().toLowerCase();
        const id = String(e.employeeId || '').toLowerCase();
        const email = String(e.email || '').toLowerCase();
        return name.includes(q) || id.includes(q) || email.includes(q);
      })
      .slice(0, 8)
      .map((e) => {
        const name = `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Employee';
        const id = e.employeeId || e.id || '-';
        return { key: `emp-${e.id}`, title: name, meta: `Employee · ${id}`, route: ['/employees', e.id] };
      });

    this.searchResults.set([...routeMatches, ...empMatches].slice(0, 10));
    this.isSearching.set(false);
  }

  goSearch(r: { route: any[] }): void {
    this.searchOpen.set(false);
    this.searchText.set('');
    this.isSearching.set(false);
    this.searchResults.set([]);
    this.router.navigate(r.route);
  }
}
