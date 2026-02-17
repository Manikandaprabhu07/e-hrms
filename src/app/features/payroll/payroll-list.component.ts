import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent, CardComponent } from '../../shared/components';

interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending' | 'Processing';
  paymentDate?: string;
}

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, CardComponent],
  template: `
    <div class="payroll-container">
      <div class="page-header">
        <h1>Payroll Management</h1>
        <p class="subtitle">Manage employee salaries and payslips</p>
      </div>

      <app-card [elevated]="true">
        <app-loading-spinner [isLoading]="isLoading()" message="Loading payroll data..." />
        
        @if (!isLoading() && payrollRecords().length > 0) {
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month/Year</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (record of payrollRecords(); track record.id) {
                  <tr>
                    <td>
                      <div class="employee-info">
                        <span class="employee-name">{{ record.employeeName }}</span>
                        <span class="employee-id">{{ record.employeeId }}</span>
                      </div>
                    </td>
                    <td>{{ record.month }}</td>
                    <td>₹{{ record.basicSalary | number }}</td>
                    <td><span class="text-success">+₹{{ record.allowances | number }}</span></td>
                    <td><span class="text-danger">-₹{{ record.deductions | number }}</span></td>
                    <td>
                      <span class="net-salary">₹{{ record.netSalary | number }}</span>
                    </td>
                    <td>
                      <span class="status-badge" [ngClass]="getStatusClass(record.status)">
                        {{ record.status }}
                      </span>
                    </td>
                    <td>{{ record.paymentDate || '-' }}</td>
                    <td>
                      <button class="btn btn-sm btn-primary" (click)="viewSlip(record)">View Slip</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (!isLoading()) {
          <p class="text-center text-muted">No payroll records found</p>
        }
      </app-card>
    </div>
  `,
  styles: [`
    .payroll-container {
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

    .table-responsive {
      width: 100%;
      height: calc(100vh - 180px); /* Fixed height */
      overflow-y: auto;
      overflow-x: auto;
      display: block;
      -webkit-overflow-scrolling: touch;
      border: 1px solid #e2e8f0;
    }

    table {
      border-collapse: collapse;
      min-width: 1400px;
      width: 100%;
      background: white;
      border: none;
      table-layout: fixed;
    }

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Column Widths */
    th:nth-child(1), td:nth-child(1) { width: 250px; } /* Employee */
    th:nth-child(2), td:nth-child(2) { width: 150px; } /* Month */
    th:nth-child(3), td:nth-child(3) { width: 140px; } /* Basic */
    th:nth-child(4), td:nth-child(4) { width: 130px; } /* Allowances */
    th:nth-child(5), td:nth-child(5) { width: 130px; } /* Deductions */
    th:nth-child(6), td:nth-child(6) { width: 140px; } /* Net */
    th:nth-child(7), td:nth-child(7) { width: 120px; } /* Status */
    th:nth-child(8), td:nth-child(8) { width: 140px; } /* date */
    th:nth-child(9), td:nth-child(9) { width: 120px; } /* Actions */

    th {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: #f8fafc;
      font-weight: 600;
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #cbd5e1;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    tr:hover td {
      background-color: #f9fafb;
    }

    .employee-info {
      display: flex;
      flex-direction: column;
    }

    .employee-name {
      font-weight: 600;
      color: #1e293b;
    }

    .employee-id {
      font-size: 12px;
      color: #64748b;
    }

    .net-salary {
      font-weight: 700;
      color: #0f172a;
    }

    .text-success { color: #16a34a; }
    .text-danger { color: #dc2626; }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.paid {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.pending {
      background: #fee2e2;
      color: #dc2626;
    }

    .status-badge.processing {
      background: #fff7ed;
      color: #ea580c;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #1e40af;
      color: white;
    }

    .btn-primary:hover {
      background: #1e3a8a;
    }

    .text-center {
      text-align: center;
      padding: 40px;
    }

    .text-muted {
      color: #64748b;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollListComponent implements OnInit {
  isLoading = signal<boolean>(true);
  payrollRecords = signal<PayrollRecord[]>([]);

  ngOnInit() {
    // Simulate API call
    setTimeout(() => {
      this.payrollRecords.set([
        {
          id: 'PR001',
          employeeName: 'Kiruthik Aswanth',
          employeeId: 'EMP001',
          month: 'January 2026',
          basicSalary: 125000,
          allowances: 15000,
          deductions: 8000,
          netSalary: 132000,
          status: 'Paid',
          paymentDate: '2026-01-31'
        },
        {
          id: 'PR002',
          employeeName: 'Manikandaprabhu User',
          employeeId: 'EMP002',
          month: 'January 2026',
          basicSalary: 110000,
          allowances: 12000,
          deductions: 7000,
          netSalary: 115000,
          status: 'Paid',
          paymentDate: '2026-01-31'
        },
        {
          id: 'PR003',
          employeeName: 'Uthaya Kumar',
          employeeId: 'EMP003',
          month: 'January 2026',
          basicSalary: 95000,
          allowances: 10000,
          deductions: 5000,
          netSalary: 100000,
          status: 'Processing'
        },
        {
          id: 'PR004',
          employeeName: 'Madesh T',
          employeeId: 'EMP004',
          month: 'January 2026',
          basicSalary: 90000,
          allowances: 8000,
          deductions: 4500,
          netSalary: 93500,
          status: 'Pending'
        },
        {
          id: 'PR005',
          employeeName: 'Joshua Davidson',
          employeeId: 'EMP005',
          month: 'January 2026',
          basicSalary: 70000,
          allowances: 5000,
          deductions: 3000,
          netSalary: 72000,
          status: 'Pending'
        }
      ]);
      this.isLoading.set(false);
    }, 1000);
  }

  viewSlip(record: PayrollRecord): void {
    alert(`Showing payslip for \${record.employeeName} for \${record.month}`);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
