import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeAvatar: string;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
}

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="management-container">
      <div class="page-header">
        <h1>Leave Management</h1>
        <p class="subtitle">{{ leaveRequests().length }} leave requests to manage</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon pending">📋</div>
          <div class="stat-info">
            <span class="stat-value">{{ pendingCount() }}</span>
            <span class="stat-label">Pending Requests</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon approved">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ approvedCount() }}</span>
            <span class="stat-label">Approved</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rejected">❌</div>
          <div class="stat-info">
            <span class="stat-value">{{ rejectedCount() }}</span>
            <span class="stat-label">Rejected</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total">📊</div>
          <div class="stat-info">
            <span class="stat-value">{{ leaveRequests().length }}</span>
            <span class="stat-label">Total Requests</span>
          </div>
        </div>
      </div>

      <app-card [elevated]="true">
        <div class="table-header">
          <h3>Leave Requests</h3>
          <button class="btn btn-primary">+ New Request</button>
        </div>

        <div class="leave-table">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (leave of leaveRequests(); track leave.id) {
                <tr>
                  <td>
                    <div class="employee-info">
                      <img [src]="leave.employeeAvatar" [alt]="leave.employeeName" class="avatar" />
                      <span class="employee-name">{{ leave.employeeName }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="leave-type-badge" [class]="leave.leaveType.toLowerCase()">
                      {{ leave.leaveType }}
                    </span>
                  </td>
                  <td>
                    <div class="date-range">
                      <span>{{ leave.startDate }}</span>
                      <span class="date-separator">→</span>
                      <span>{{ leave.endDate }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="days-badge">{{ leave.days }} days</span>
                  </td>
                  <td>
                    <span class="reason-text">{{ leave.reason }}</span>
                  </td>
                  <td>
                    <span class="status-badge" [class]="leave.status.toLowerCase()">
                      {{ leave.status }}
                    </span>
                  </td>
                  <td>
                    @if (leave.status === 'Pending') {
                      <button class="btn btn-sm btn-success" (click)="approveLeave(leave.id)">Approve</button>
                      <button class="btn btn-sm btn-danger" (click)="rejectLeave(leave.id)">Reject</button>
                    } @else {
                      <button class="btn btn-sm btn-secondary">View</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .management-container {
      padding: 0;
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

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .stat-icon.pending { background: #fef3c7; }
    .stat-icon.approved { background: #dcfce7; }
    .stat-icon.rejected { background: #fee2e2; }
    .stat-icon.total { background: #e0f2fe; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 13px;
      color: #64748b;
    }

    /* Table Header */
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .leave-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background-color: #f8fafc;
      font-weight: 600;
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    tr:hover {
      background-color: #f8fafc;
    }

    .employee-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .employee-name {
      font-weight: 600;
      color: #1e293b;
    }

    .leave-type-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .leave-type-badge.annual { background: #dbeafe; color: #1e40af; }
    .leave-type-badge.sick { background: #fee2e2; color: #dc2626; }
    .leave-type-badge.personal { background: #f3e8ff; color: #7c3aed; }
    .leave-type-badge.maternity { background: #fce7f3; color: #be185d; }
    .leave-type-badge.paternity { background: #e0f2fe; color: #0369a1; }

    .date-range {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #374151;
    }

    .date-separator {
      color: #9ca3af;
    }

    .days-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #f3f4f6;
      color: #374151;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .reason-text {
      font-size: 13px;
      color: #64748b;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #b45309;
    }

    .status-badge.approved {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.rejected {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      margin-right: 6px;
    }

    .btn-primary {
      background: #1e40af;
      color: white;
    }

    .btn-primary:hover {
      background: #1e3a8a;
    }

    .btn-success {
      background: #16a34a;
      color: white;
    }

    .btn-success:hover {
      background: #15803d;
    }

    .btn-danger {
      background: #dc2626;
      color: white;
    }

    .btn-danger:hover {
      background: #b91c1c;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaveListComponent implements OnInit {
  leaveRequests = signal<LeaveRequest[]>([]);

  pendingCount = signal(0);
  approvedCount = signal(0);
  rejectedCount = signal(0);

  ngOnInit(): void {
    // Mock leave data
    const mockLeaves: LeaveRequest[] = [
      {
        id: '1',
        employeeName: 'Mani Kandaprabhu',
        employeeAvatar: 'https://ui-avatars.com/api/?name=Mani+Kandaprabhu&background=1e40af&color=fff',
        leaveType: 'Annual',
        startDate: '2026-02-10',
        endDate: '2026-02-14',
        days: 5,
        reason: 'Family vacation',
        status: 'Pending',
        appliedOn: '2026-01-28'
      },
      {
        id: '2',
        employeeName: 'Uthaya Kumar',
        employeeAvatar: 'https://ui-avatars.com/api/?name=Uthaya+Kumar&background=14b8a6&color=fff',
        leaveType: 'Sick',
        startDate: '2026-01-30',
        endDate: '2026-01-31',
        days: 2,
        reason: 'Medical appointment',
        status: 'Approved',
        appliedOn: '2026-01-29'
      },
      {
        id: '3',
        employeeName: 'Madesh T',
        employeeAvatar: 'https://ui-avatars.com/api/?name=Madesh+T&background=f59e0b&color=fff',
        leaveType: 'Personal',
        startDate: '2026-02-05',
        endDate: '2026-02-06',
        days: 2,
        reason: 'Personal work',
        status: 'Pending',
        appliedOn: '2026-01-30'
      },
      {
        id: '4',
        employeeName: 'Joshua David',
        employeeAvatar: 'https://ui-avatars.com/api/?name=Joshua+David&background=ef4444&color=fff',
        leaveType: 'Annual',
        startDate: '2026-02-20',
        endDate: '2026-02-25',
        days: 6,
        reason: 'Wedding ceremony',
        status: 'Approved',
        appliedOn: '2026-01-25'
      },
      {
        id: '5',
        employeeName: 'Mani Kandaprabhu',
        employeeAvatar: 'https://ui-avatars.com/api/?name=Mani+Kandaprabhu&background=1e40af&color=fff',
        leaveType: 'Sick',
        startDate: '2026-01-15',
        endDate: '2026-01-15',
        days: 1,
        reason: 'Not feeling well',
        status: 'Rejected',
        appliedOn: '2026-01-14'
      }
    ];

    this.leaveRequests.set(mockLeaves);
    this.updateCounts(mockLeaves);
  }

  updateCounts(leaves: LeaveRequest[]): void {
    this.pendingCount.set(leaves.filter(l => l.status === 'Pending').length);
    this.approvedCount.set(leaves.filter(l => l.status === 'Approved').length);
    this.rejectedCount.set(leaves.filter(l => l.status === 'Rejected').length);
  }

  approveLeave(id: string): void {
    this.leaveRequests.update(leaves =>
      leaves.map(l => l.id === id ? { ...l, status: 'Approved' as const } : l)
    );
    this.updateCounts(this.leaveRequests());
  }

  rejectLeave(id: string): void {
    this.leaveRequests.update(leaves =>
      leaves.map(l => l.id === id ? { ...l, status: 'Rejected' as const } : l)
    );
    this.updateCounts(this.leaveRequests());
  }
}
