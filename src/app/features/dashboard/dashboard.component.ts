import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, EmployeeService } from '../../core/services';
import { CardComponent } from '../../shared/components';
import { FormsModule } from '@angular/forms';

interface DashboardStat {
  title: string;
  value: string | number;
  trend?: number;
  trendText?: string;
  icon: string;
  color: string;
  route?: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  type: 'leave' | 'join' | 'approve' | 'update';
  timeAgo: string;
  image?: string;
}

interface QuickAction {
  title: string;
  icon: string;
  action: () => void;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'warning' | 'success';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, FormsModule],
  template: `
    <div class="dashboard-wrapper">
      <!-- Page Header -->
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Welcome back, {{ user()?.firstName }}! Here's what's happening today.</p>
      </div>

      <!-- Main Content -->
      <main class="dashboard-main">
        
        @if (isAdmin()) {
          <!-- ADMIN DASHBOARD -->
          <section class="stats-section">
            <div class="stats-grid">
              @for (stat of kpiStats(); track stat.title) {
                <div class="kpi-card" [style.border-left-color]="stat.color">
                  <div class="kpi-header">
                    <span class="kpi-icon">{{ stat.icon }}</span>
                    <span class="kpi-title">{{ stat.title }}</span>
                  </div>
                  <div class="kpi-value">{{ stat.value }}</div>
                  @if (stat.trend !== undefined) {
                    <div class="kpi-trend" [class.positive]="stat.trend > 0" [class.negative]="stat.trend < 0">
                      <span class="trend-arrow">{{ stat.trend > 0 ? '↑' : stat.trend < 0 ? '↓' : '=' }}</span>
                      <span class="trend-text">{{ stat.trendText }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </section>

          <div class="dashboard-grid">
            <!-- Pending Leave Requests -->
            <section class="leave-section">
              <app-card [title]="'Pending Leave Requests'" [elevated]="true">
                <p class="section-subtitle">{{ pendingLeaves().length }} requests awaiting approval</p>
                @if (pendingLeaves().length > 0) {
                  <div class="leaves-list">
                    @for (leave of pendingLeaves().slice(0, 3); track leave.id) {
                      <div class="leave-item">
                        <img [src]="leave.image" [alt]="leave.name" class="leave-avatar" />
                        <div class="leave-info">
                          <h4>{{ leave.name }}</h4>
                          <p class="leave-type">{{ leave.department }} · {{ leave.leaveType }}</p>
                          <p class="leave-dates">{{ leave.startDate }} - {{ leave.endDate }} ({{ leave.days }} days)</p>
                        </div>
                        <div class="leave-actions">
                          <button class="btn-approve">✓</button>
                          <button class="btn-reject">✕</button>
                        </div>
                      </div>
                    }
                  </div>
                  @if (pendingLeaves().length > 3) {
                    <a href="#" class="view-all-link">View all →</a>
                  }
                }
              </app-card>
            </section>

            <!-- Recent Activity -->
            <section class="activity-section">
              <app-card [title]="'Recent Activity'" [elevated]="true">
                <a href="#" class="view-all-link">View all →</a>
                <div class="activity-list">
                  @for (activity of recentActivities(); track activity.id) {
                    <div class="activity-item">
                      <img [src]="activity.image" [alt]="activity.user" class="activity-avatar" />
                      <div class="activity-info">
                        <p class="activity-text">
                          <strong>{{ activity.user }}</strong> {{ activity.action }}
                        </p>
                        <p class="activity-time">{{ activity.timeAgo }}</p>
                      </div>
                      <span class="activity-badge" [class]="'badge-' + activity.type">
                        {{ activity.type | titlecase }}
                      </span>
                    </div>
                  }
                </div>
              </app-card>
            </section>
          </div>

          <!-- Quick Actions -->
          <section class="quick-actions-section">
            <h2>Quick Actions</h2>
            <div class="quick-actions-grid">
              @for (action of adminQuickActions(); track action.title) {
                <button (click)="action.action()" class="quick-action-btn">
                  <span class="action-icon">{{ action.icon }}</span>
                  <span class="action-title">{{ action.title }}</span>
                </button>
              }
            </div>
          </section>

          <div class="dashboard-grid-bottom">
            <section class="events-section">
              <app-card [title]="'Upcoming Events'" [elevated]="true">
                <a href="#" class="view-all-link">View calendar →</a>
                <div class="events-list">
                  @for (event of upcomingEvents(); track event.id) {
                    <div class="event-item">
                      <span class="event-icon">{{ event.icon }}</span>
                      <div class="event-info">
                        <h4>{{ event.name }}</h4>
                        <p>{{ event.date }}</p>
                      </div>
                    </div>
                  }
                </div>
              </app-card>
            </section>

            <section class="department-section">
              <app-card [title]="'Employees by Department'" [elevated]="true">
                <div class="department-list">
                  @for (dept of departmentData(); track dept.name) {
                    <div class="department-item">
                      <div class="dept-info">
                        <span class="dept-icon">{{ dept.icon }}</span>
                        <div>
                          <h4>{{ dept.name }}</h4>
                          <p>{{ dept.count }} employees</p>
                        </div>
                      </div>
                      <div class="dept-bar">
                        <div class="dept-bar-fill" [style.width.%]="dept.percentage" [style.background]="dept.color"></div>
                      </div>
                    </div>
                  }
                </div>
              </app-card>
            </section>
          </div>
        } @else {
          <!-- EMPLOYEE DASHBOARD -->
          <section class="stats-section">
            <div class="stats-grid">
              <div class="kpi-card" style="border-left-color: #28a745">
                <div class="kpi-header">
                  <span class="kpi-icon">📅</span>
                  <span class="kpi-title">Attendance</span>
                </div>
                <div class="kpi-value">98%</div>
                <div class="kpi-trend positive">
                  <span class="trend-text">Present today</span>
                </div>
              </div>
              <div class="kpi-card" style="border-left-color: #007bff">
                <div class="kpi-header">
                  <span class="kpi-icon">🌴</span>
                  <span class="kpi-title">Leave Balance</span>
                </div>
                <div class="kpi-value">12</div>
                <div class="trend-text">Days remaining</div>
              </div>
              <div class="kpi-card" style="border-left-color: #ffc107">
                <div class="kpi-header">
                  <span class="kpi-icon">⏰</span>
                  <span class="kpi-title">Next Holiday</span>
                </div>
                <div class="kpi-value">2</div>
                <div class="trend-text">Days until Pongal</div>
              </div>
            </div>
          </section>

          <!-- Employee Actions & Notices -->
          <div class="dashboard-grid">
            <!-- Notices -->
            <section class="notices-section">
              <app-card [title]="'Company Notices'" [elevated]="true">
                <div class="notices-list">
                  @for (notice of notices(); track notice.id) {
                    <div class="notice-item" [class]="'notice-' + notice.type">
                      <div class="notice-header">
                        <h4>{{ notice.title }}</h4>
                        <span class="notice-date">{{ notice.date }}</span>
                      </div>
                      <p>{{ notice.content }}</p>
                    </div>
                  }
                </div>
              </app-card>
            </section>

             <!-- Quick Actions & Feedback -->
             <div class="employee-sidebar-col">
              <section class="quick-actions-section">
                <app-card [title]="'Quick Actions'" [elevated]="true">
                  <div class="quick-actions-grid-sm">
                    <button class="quick-action-btn" (click)="requestLeave()">
                      <span class="action-icon">✈️</span>
                      <span class="action-title">Request Leave</span>
                    </button>
                    <button class="quick-action-btn" (click)="viewPayslip()">
                      <span class="action-icon">📄</span>
                      <span class="action-title">View Payslip</span>
                    </button>
                  </div>
                </app-card>
              </section>

              <section class="feedback-section" style="margin-top: 24px;">
                <app-card [title]="'Send Feedback'" [elevated]="true">
                  <div class="feedback-form">
                    <textarea 
                      [(ngModel)]="feedbackMessage" 
                      placeholder="Share your thoughts, suggestions or concerns anonymously..."
                      rows="4"></textarea>
                    <button class="btn-primary full-width" (click)="sendFeedback()">Send Feedback</button>
                  </div>
                </app-card>
              </section>
             </div>
          </div>
        }

      </main>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      min-height: 100%;
      background: transparent;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }

    .subtitle {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: #64748b;
    }

    .dashboard-main {
      max-width: 1400px;
    }

    /* KPI Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .kpi-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 8px;
      padding: 20px;
      border-left: 4px solid;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .kpi-icon {
      font-size: 20px;
    }

    .kpi-title {
      font-size: 13px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
    }

    .kpi-value {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #999;
    }

    .kpi-trend.positive {
      color: #28a745;
    }

    .kpi-trend.negative {
      color: #dc3545;
    }

    .trend-arrow {
      font-weight: bold;
    }

    /* Dashboard Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .leave-section,
    .activity-section,
    .notices-section {
      min-height: 400px;
    }

    .section-subtitle {
      margin: 0 0 16px 0;
      font-size: 13px;
      color: #666;
    }

    /* Leaves List */
    .leaves-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .leave-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: rgba(249, 250, 251, 0.7);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border-radius: 6px;
      align-items: flex-start;
    }

    .leave-avatar,
    .activity-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .leave-info {
      flex: 1;
      min-width: 0;
    }

    .leave-info h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .leave-type {
      margin: 2px 0;
      font-size: 12px;
      color: #666;
    }

    .leave-dates {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #999;
    }

    .leave-actions {
      display: flex;
      gap: 6px;
    }

    .btn-approve,
    .btn-reject {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s;
    }

    .btn-approve {
      background: #28a745;
      color: white;
    }

    .btn-approve:hover {
      background: #218838;
    }

    .btn-reject {
      background: #dc3545;
      color: white;
    }

    .btn-reject:hover {
      background: #c82333;
    }

    /* Activity List */
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: rgba(249, 250, 251, 0.7);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border-radius: 6px;
      align-items: center;
    }

    .activity-info {
      flex: 1;
      min-width: 0;
    }

    .activity-text {
      margin: 0;
      font-size: 13px;
      color: #1a1a1a;
      line-height: 1.4;
    }

    .activity-time {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #999;
    }

    .activity-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .badge-leave {
      background: #fff3cd;
      color: #856404;
    }

    .badge-join {
      background: #d1ecf1;
      color: #0c5460;
    }

    .badge-approve {
      background: #d4edda;
      color: #155724;
    }

    .badge-update {
      background: #e2e3e5;
      color: #383d41;
    }

    /* Quick Actions */
    .quick-actions-section {
      margin-bottom: 32px;
    }

    .quick-actions-section h2 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .quick-actions-grid-sm {
       display: grid;
       grid-template-columns: 1fr 1fr;
       gap: 12px;
    }

    .quick-action-btn {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(224, 224, 224, 0.5);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
      font-size: 13px;
      font-weight: 600;
      width: 100%;
    }

    .quick-action-btn:hover {
      border-color: #007bff;
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: 24px;
    }

    .action-title {
      color: #1a1a1a;
    }

    /* Dashboard Bottom Grid */
    .dashboard-grid-bottom {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    /* Events */
    .events-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .event-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: rgba(249, 250, 251, 0.7);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border-radius: 6px;
      align-items: center;
    }

    .event-icon {
      font-size: 24px;
    }

    .event-info h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .event-info p {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #999;
    }

    /* Departments */
    .department-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .department-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .dept-info {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .dept-icon {
      font-size: 24px;
    }

    .dept-info h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .dept-info p {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #999;
    }

    .dept-bar {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }

    .dept-bar-fill {
      height: 100%;
      transition: width 0.3s;
    }

    /* View All Links */
    .view-all-link {
      display: inline-block;
      margin-bottom: 16px;
      color: #007bff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: color 0.3s;
    }

    .view-all-link:hover {
      color: #0056b3;
    }

    /* Notices */
    .notices-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .notice-item {
      padding: 16px;
      border-radius: 6px;
      border-left: 4px solid #ccc;
      background: #f8fafc;
    }

    .notice-info { border-left-color: #3b82f6; background: #eff6ff; }
    .notice-warning { border-left-color: #f59e0b; background: #fffbeb; }
    .notice-success { border-left-color: #10b981; background: #ecfdf5; }

    .notice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .notice-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .notice-date {
      font-size: 12px;
      color: #64748b;
    }

    .notice-item p {
      margin: 0;
      font-size: 13px;
      color: #334155;
    }

    /* Feedback Form */
    .feedback-form textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      resize: vertical;
      font-family: inherit;
      font-size: 14px;
      margin-bottom: 12px;
    }

    .feedback-form textarea:focus {
      outline: none;
      border-color: #3b82f6;
      ring: 2px solid #eff6ff;
    }

    .btn-primary.full-width {
      width: 100%;
      background: #1e40af;
      color: white;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .btn-primary:hover {
      background: #1e3a8a;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .dashboard-main {
        padding: 16px;
      }

      .stats-grid,
      .quick-actions-grid,
      .dashboard-grid,
      .dashboard-grid-bottom {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);

  user = this.authService.user;
  isAdmin = computed(() => this.authService.hasRole('ADMIN'));

  // Feedback Model
  feedbackMessage = '';

  // Employee Data Signals
  notices = signal<Notice[]>([
    {
      id: '1',
      title: 'Holiday Announcement',
      content: 'The office will be closed on Jan 15th for Pongal. Enjoy the festival!',
      date: 'Jan 10, 2024',
      type: 'info'
    },
    {
      id: '2',
      title: 'Q4 All Hands Meeting',
      content: 'Mandatory meeting for all engineering staff this Friday at 4 PM.',
      date: 'Jan 12, 2024',
      type: 'warning'
    },
    {
      id: '3',
      title: 'Salary Credited',
      content: 'January salary has been processed and credited to your accounts.',
      date: 'Feb 01, 2024',
      type: 'success'
    }
  ]);

  // Admin Data Signals
  kpiStats = computed(() => {
    const totalEmployees = this.employeeService.employeeCount();
    const activeEmployees = Math.floor(totalEmployees * 0.92); // 92% active
    const onLeave = Math.floor(totalEmployees * 0.05); // 5% on leave
    const resigned = Math.floor(totalEmployees * 0.03); // 3% resigned
    const newHires = 8; // This month
    const attritionRate = 2.5; // Percentage

    return [
      {
        title: 'Total Employees',
        value: totalEmployees,
        trend: 8,
        trendText: '↑ 8% vs last month',
        icon: '👥',
        color: '#007bff'
      },
      {
        title: 'Active Employees',
        value: activeEmployees,
        trend: 3,
        trendText: '↑ 3% vs last month',
        icon: '✅',
        color: '#28a745'
      },
      {
        title: 'On Leave',
        value: onLeave,
        trend: -10,
        trendText: '↓ 10% vs last month',
        icon: '📅',
        color: '#ffc107'
      },
      {
        title: 'New Hires',
        value: newHires,
        trend: 15,
        trendText: '↑ 15% vs last month',
        icon: '🆕',
        color: '#17a2b8'
      },
      {
        title: 'Resigned',
        value: resigned,
        trend: -5,
        trendText: '↓ 5% vs last month',
        icon: '🚪',
        color: '#dc3545'
      },
      {
        title: 'Attrition Rate',
        value: `${attritionRate}%`,
        trend: -2,
        trendText: '↓ 2% vs last month',
        icon: '📊',
        color: '#6f42c1'
      }
    ];
  });

  // Employee Status Breakdown
  employeeStatusBreakdown = computed(() => {
    const total = this.employeeService.employeeCount();
    return {
      active: Math.floor(total * 0.92),
      onLeave: Math.floor(total * 0.05),
      resigned: Math.floor(total * 0.03),
      probation: Math.floor(total * 0.08)
    };
  });

  // Monthly Hiring Trend (last 6 months)
  monthlyHiringTrend = signal([
    { month: 'Aug', hires: 5 },
    { month: 'Sep', hires: 7 },
    { month: 'Oct', hires: 6 },
    { month: 'Nov', hires: 9 },
    { month: 'Dec', hires: 8 },
    { month: 'Jan', hires: 8 }
  ]);

  // Attrition Rate Calculation
  attritionRate = computed(() => {
    const total = this.employeeService.employeeCount();
    const resigned = Math.floor(total * 0.03);
    return ((resigned / total) * 100).toFixed(1);
  });

  pendingLeaves = signal([
    {
      id: '1',
      name: 'Sarah Johnson',
      department: 'Design',
      leaveType: 'Annual Leave',
      startDate: 'Dec 25',
      endDate: 'Dec 30',
      days: 5,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Lisa Wang',
      department: 'Marketing',
      leaveType: 'Sick Leave',
      startDate: 'Jan 24',
      endDate: 'Jan 24',
      days: 1,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    },
    {
      id: '3',
      name: 'Tom Wilson',
      department: 'Engineering',
      leaveType: 'Personal Leave',
      startDate: 'Jan 28',
      endDate: 'Jan 29',
      days: 2,
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
    }
  ]);

  recentActivities = signal<Activity[]>([
    {
      id: '1',
      user: 'Sarah Johnson',
      action: 'requested Annual Leave (Dec 25-30)',
      type: 'leave',
      timeAgo: '10 min ago',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    {
      id: '2',
      user: 'Mike Chen',
      action: 'joined Engineering Department',
      type: 'join',
      timeAgo: '1 hour ago',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    {
      id: '3',
      user: 'Emily Davis',
      action: 'approved Q4 Performance Review',
      type: 'approve',
      timeAgo: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    {
      id: '4',
      user: 'Alex Thompson',
      action: 'updated Personal Information',
      type: 'update',
      timeAgo: '3 hours ago',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    }
  ]);

  upcomingEvents = signal([
    {
      id: '1',
      name: "Sarah's Birthday",
      date: 'Today',
      icon: '🎂'
    },
    {
      id: '2',
      name: 'Team Standup',
      date: 'Today, 10:00 AM',
      icon: '👥'
    },
    {
      id: '3',
      name: "Mike's Work Anniversary",
      date: 'Tomorrow',
      icon: '🎉'
    },
    {
      id: '4',
      name: 'Q4 Review Deadline',
      date: 'Jan 28, 2024',
      icon: '📅'
    }
  ]);

  departmentData = computed(() => [
    { name: 'Engineering', count: 28, percentage: 23, icon: '⚙️', color: '#007bff' },
    { name: 'Design', count: 18, percentage: 15, icon: '🎨', color: '#28a745' },
    { name: 'Marketing', count: 22, percentage: 18, icon: '📱', color: '#ffc107' },
    { name: 'Sales', count: 32, percentage: 27, icon: '💼', color: '#dc3545' },
    { name: 'HR & Admin', count: 20, percentage: 17, icon: '📋', color: '#6f42c1' }
  ]);

  adminQuickActions = (): QuickAction[] => [
    { title: 'Add Employee', icon: '➕', action: () => alert('Add Employee') },
    { title: 'Generate Report', icon: '📊', action: () => alert('Generate Report') },
    { title: 'Schedule Meeting', icon: '📅', action: () => alert('Schedule Meeting') },
    { title: 'Log Attendance', icon: '✓', action: () => alert('Log Attendance') },
    { title: 'Send Announcement', icon: '📢', action: () => alert('Send Announcement') },
    { title: 'Export Data', icon: '💾', action: () => alert('Export Data') }
  ];

  ngOnInit() {
    this.employeeService.getEmployees({ pageSize: 10, pageNumber: 1 });
  }

  // Employee Actions
  requestLeave() {
    alert('Leave Request Form Submitted! (Mock)');
  }

  viewPayslip() {
    alert('Opening Payslip PDF... (Mock)');
  }

  sendFeedback() {
    if (this.feedbackMessage.trim()) {
      alert(`Feedback Sent: "\${this.feedbackMessage}"`);
      this.feedbackMessage = '';
    } else {
      alert('Please enter a message before sending.');
    }
  }
}
