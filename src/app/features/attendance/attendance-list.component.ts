import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components';
import { AuthService, AttendanceService, EmployeeService } from '../../core/services';
import type { ApiAttendance, AttendanceStatus } from '../../core/services/attendance.service';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <div class="attendance-wrapper">
      <div class="page-header">
        <h1>Attendance</h1>
        <p class="subtitle" *ngIf="isAdmin(); else empSub">
          Admin can mark attendance for employees. Employees can only view their own attendance.
        </p>
        <ng-template #empSub>
          <p class="subtitle">Your attendance records</p>
        </ng-template>
      </div>

      @if (isAdmin()) {
        <app-card [title]="'Mark Attendance'" [elevated]="true">
          <div class="daily-card">
            <div class="daily-top">
              <div class="daily-title">Daily Present (Checkbox)</div>
              <div class="daily-date">Date: {{ dailyDate }}</div>
            </div>

            <div class="daily-grid">
              @for (emp of employees(); track emp.id) {
                <label class="daily-item">
                  <input type="checkbox" [checked]="dailyPresent()[emp.id]" (change)="toggleDaily(emp.id, $any($event.target).checked)" />
                  <span class="daily-name">{{ emp.employeeId }} - {{ emp.firstName }} {{ emp.lastName }}</span>
                </label>
              }
            </div>

            <div class="form-actions" style="margin-top:12px">
              <button class="btn-primary" (click)="saveDailyPresent()" [disabled]="dailySaving()">
                {{ dailySaving() ? 'Saving...' : 'Save Present For Selected' }}
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <div class="form-grid">
            <div class="form-group">
              <label>Employee</label>
              <select [(ngModel)]="newRecord.employeeId">
                <option value="">Select employee</option>
                @for (emp of employees(); track emp.id) {
                  <option [value]="emp.id">{{ emp.employeeId }} - {{ emp.firstName }} {{ emp.lastName }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Date</label>
              <input type="date" [(ngModel)]="newRecord.date" />
            </div>

            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="newRecord.status">
                @for (s of statuses; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Clock In (optional)</label>
              <input type="datetime-local" [(ngModel)]="newRecord.clockIn" />
            </div>

            <div class="form-group">
              <label>Clock Out (optional)</label>
              <input type="datetime-local" [(ngModel)]="newRecord.clockOut" />
            </div>

            <div class="form-actions">
              <button class="btn-primary" (click)="markAttendance()" [disabled]="isSaving()">
                {{ isSaving() ? 'Saving...' : 'Save Attendance' }}
              </button>
              <button class="btn-secondary" (click)="reload()" [disabled]="isLoading()">Refresh</button>
            </div>
          </div>
        </app-card>
      } @else {
        <div class="toolbar">
          <button class="btn-secondary" (click)="reload()" [disabled]="isLoading()">Refresh</button>
        </div>
      }

      <app-card [title]="isAdmin() ? 'All Attendance Records' : 'My Attendance Records'" [elevated]="true">
        @if (isLoading()) {
          <p class="muted">Loading...</p>
        } @else if (records().length === 0) {
          <p class="muted">No attendance records found.</p>
        } @else {
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  @if (isAdmin()) { <th>Employee</th> }
                  <th>Date</th>
                  <th>Status</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                </tr>
              </thead>
              <tbody>
                @for (r of records(); track r.id) {
                  <tr>
                    @if (isAdmin()) {
                      <td>
                        <div class="emp-cell">
                          <div class="emp-name">{{ r.employee.firstName }} {{ r.employee.lastName }}</div>
                          <div class="emp-id">{{ r.employee.employeeId }}</div>
                        </div>
                      </td>
                    }
                    <td>{{ r.date }}</td>
                    <td class="status">{{ formatStatus(r.status) }}</td>
                    <td>{{ formatDateTime(r.clockIn) }}</td>
                    <td>{{ formatDateTime(r.clockOut) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </app-card>
    </div>
  `,
  styles: [`
    .attendance-wrapper { max-width: 1400px; }
    .page-header { margin-bottom: 16px; }
    h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1e293b; }
    .subtitle { margin: 6px 0 0 0; color: #64748b; font-size: 13px; }

    .toolbar { margin: 0 0 16px 0; }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
      align-items: end;
    }

    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .form-group input, .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: rgba(255,255,255,0.85);
      outline: none;
    }

    .form-actions { display: flex; gap: 10px; align-items: center; }

    .divider { height: 1px; background: rgba(226,232,240,0.9); margin: 14px 0; }

    .daily-card {
      border: 1px solid rgba(226,232,240,0.9);
      border-radius: 12px;
      padding: 12px 12px;
      background: rgba(255,255,255,0.82);
    }
    .daily-top { display:flex; justify-content: space-between; gap: 10px; align-items: center; }
    .daily-title { font-size: 13px; font-weight: 900; color: #0f172a; }
    .daily-date { font-size: 12px; font-weight: 800; color: #64748b; }
    .daily-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 10px;
      margin-top: 10px;
      max-height: 220px;
      overflow: auto;
      padding-right: 6px;
    }
    .daily-item {
      display:flex;
      gap: 10px;
      align-items: center;
      border: 1px solid rgba(226,232,240,0.9);
      border-radius: 10px;
      padding: 10px 10px;
      background: rgba(255,255,255,0.9);
      cursor: pointer;
      user-select: none;
    }
    .daily-name { font-size: 12px; font-weight: 800; color: #0f172a; }

    .btn-primary, .btn-secondary {
      border: none;
      border-radius: 8px;
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-primary { background: #2563eb; color: #fff; }
    .btn-secondary { background: #e2e8f0; color: #0f172a; }
    .btn-primary:disabled, .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

    .table-wrap { overflow: auto; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 10px 12px; border-bottom: 1px solid rgba(226,232,240,0.9); text-align: left; font-size: 13px; }
    .table th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
    .muted { color: #64748b; margin: 0; }
    .emp-cell { display: flex; flex-direction: column; line-height: 1.2; }
    .emp-name { font-weight: 700; color: #0f172a; }
    .emp-id { color: #64748b; font-size: 12px; }
    .status { font-weight: 700; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceListComponent implements OnInit {
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);

  isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  isLoading = computed(() => this.attendanceService.isLoading());

  records = signal<ApiAttendance[]>([]);
  employees = signal<{ id: string; employeeId: string; firstName: string; lastName: string }[]>([]);

  isSaving = signal(false);

  statuses: AttendanceStatus[] = [
    'present',
    'absent',
    'late',
    'half_day',
    'work_from_home',
    'on_leave',
    'holiday',
    'weekend',
  ];

  newRecord: { employeeId: string; date: string; status: AttendanceStatus; clockIn?: string; clockOut?: string } = {
    employeeId: '',
    date: '',
    status: 'present',
    clockIn: '',
    clockOut: '',
  };

  // Daily marking (admin)
  dailyDate = '';
  dailyPresent = signal<Record<string, boolean>>({}); // employeeId -> present?
  dailySaving = signal(false);

  async ngOnInit(): Promise<void> {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    this.newRecord.date = iso;
    this.dailyDate = iso;

    await this.reload();
    if (this.isAdmin()) {
      await this.loadEmployees();
      // init checkbox map
      const map: Record<string, boolean> = {};
      for (const e of this.employees()) map[e.id] = false;
      this.dailyPresent.set(map);
    }
  }

  async reload(): Promise<void> {
    const records = this.isAdmin()
      ? await this.attendanceService.getAll()
      : await this.attendanceService.getMine();
    this.records.set(records);
  }

  private async loadEmployees(): Promise<void> {
    // Grab employees for dropdown (backend currently returns array; we handle both shapes in service)
    await this.employeeService.getEmployees({ pageNumber: 1, pageSize: 1000 });
    const list = (this.employeeService.employees() || []).map((e: any) => ({
      id: e.id,
      employeeId: e.employeeId,
      firstName: e.firstName,
      lastName: e.lastName,
    }));
    this.employees.set(list);
  }

  async markAttendance(): Promise<void> {
    if (!this.newRecord.employeeId || !this.newRecord.date) {
      alert('Please select employee and date.');
      return;
    }

    try {
      this.isSaving.set(true);
      await this.attendanceService.markAttendance({
        employeeId: this.newRecord.employeeId,
        date: this.newRecord.date,
        status: this.newRecord.status,
        clockIn: this.newRecord.clockIn || null,
        clockOut: this.newRecord.clockOut || null,
      });
      this.newRecord.clockIn = '';
      this.newRecord.clockOut = '';
      await this.reload();
    } finally {
      this.isSaving.set(false);
    }
  }

  toggleDaily(empId: string, checked: boolean): void {
    this.dailyPresent.update((m) => ({ ...m, [empId]: checked }));
  }

  async saveDailyPresent(): Promise<void> {
    if (!this.dailyDate) return;
    const map = this.dailyPresent();
    const selected = Object.entries(map).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) {
      alert('Please select at least one employee.');
      return;
    }

    try {
      this.dailySaving.set(true);
      for (const empId of selected) {
        await this.attendanceService.markAttendance({
          employeeId: empId,
          date: this.dailyDate,
          status: 'present',
          clockIn: null,
          clockOut: null,
        });
      }
      await this.reload();
      // keep same date, reset selection
      const reset: Record<string, boolean> = {};
      for (const e of this.employees()) reset[e.id] = false;
      this.dailyPresent.set(reset);
    } finally {
      this.dailySaving.set(false);
    }
  }

  formatStatus(value: string | null): string {
    if (!value) return '-';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  formatDateTime(value: string | null): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  }
}
