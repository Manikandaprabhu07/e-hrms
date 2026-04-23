import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, FrappeHrService } from '../../core/services';
import { WORKSPACE_STYLES } from './workspace.styles';

@Component({
  selector: 'app-expenses-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-shell">
      <section class="hero">
        <span class="eyebrow">Expense claims</span>
        <h1>Claims, reimbursements, loans, and payroll payouts</h1>
        <p>
          Review reimbursements, manage employee advances, and keep payroll-related payouts visible
          from one finance-ready workspace.
        </p>
      </section>

      <section class="stats-grid">
        @for (stat of service.expenseStats(); track stat.label) {
          <article class="stat-card">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </article>
        }
      </section>

      <section class="section-grid">
        <article class="list-card">
          <div class="list-card-header">
            <div>
              <h2>{{ isAdmin() ? 'Expense claims' : 'My expense claims' }}</h2>
              <p class="item-note">
                {{ isAdmin() ? 'Review employee claims and move them to payout.' : 'Submit a reimbursement request for admin approval.' }}
              </p>
            </div>
          </div>

          @if (!isAdmin()) {
            <div class="request-form-card">
              <div class="item-main" style="width:100%;">
                <div class="item-title">Submit expense claim</div>
                <p class="item-note">Choose the expense reason, enter the cash amount, and share what it is linked to.</p>
                <div class="request-form-grid">
                  <label class="form-field">
                    <span>Expense type</span>
                    <select [(ngModel)]="claimCategory">
                      @for (option of expenseCategories; track option) {
                        <option [value]="option">{{ option }}</option>
                      }
                    </select>
                  </label>
                  <label class="form-field">
                    <span>Cash amount</span>
                    <input [(ngModel)]="claimAmount" type="number" min="0" placeholder="Enter amount" />
                  </label>
                  <label class="form-field">
                    <span>Payment mode</span>
                    <select [(ngModel)]="claimPaymentMode">
                      @for (option of paymentModes; track option) {
                        <option [value]="option">{{ option }}</option>
                      }
                    </select>
                  </label>
                  <label class="form-field form-field-wide">
                    <span>Reason</span>
                    <select [(ngModel)]="claimReason">
                      @for (option of expenseReasons; track option) {
                        <option [value]="option">{{ option }}</option>
                      }
                    </select>
                  </label>
                  <label class="form-field form-field-wide">
                    <span>Linked to</span>
                    <input [(ngModel)]="claimLinkedTo" placeholder="Project, client visit, office purchase, etc." />
                  </label>
                </div>
                <div class="form-actions">
                  <button class="action-button primary" (click)="submitExpenseClaim()">Submit claim</button>
                </div>
              </div>
            </div>
          }

          <div class="list">
            @for (claim of service.expenseClaims(); track claim.id) {
              @if (isAdmin() || claim.employee === currentEmployeeName()) {
                <div class="list-item">
                <div class="item-main">
                <div class="item-title">{{ claim.employee }}</div>
                <div class="item-subtitle">{{ claim.category }} | {{ claim.amount }}</div>
                  <div class="item-note">{{ claim.submittedOn }} | {{ claim.paymentMode || 'Cash' }} | {{ claim.reason || 'No reason provided' }}</div>
                  <div class="item-note">Linked to {{ claim.linkedTo }}</div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:10px;">
                  <span class="badge" [class.planned]="claim.status === 'Pending'" [class.new]="claim.status === 'Approved'" [class.existing]="claim.status === 'Paid'">
                    {{ claim.status }}
                  </span>
                  @if (claim.status === 'Pending' && isAdmin()) {
                    <div style="display:flex; gap:8px;">
                      <button class="action-button secondary" (click)="service.updateExpenseStatus(claim.id, 'Approved')">
                        Approve
                      </button>
                      <button class="action-button secondary" (click)="service.updateExpenseStatus(claim.id, 'Rejected')">
                        Reject
                      </button>
                    </div>
                  }
                </div>
                </div>
              }
            }
          </div>
        </article>

        <article class="list-card">
          <div class="list-card-header">
            <div>
              <h2>Loans and salary advances</h2>
              <p class="item-note">Short-term employee finance requests.</p>
            </div>
          </div>

          <div class="list">
            @for (loan of service.loans(); track loan.id) {
              <div class="list-item">
                <div class="item-main">
                  <div class="item-title">{{ loan.employee }}</div>
                  <div class="item-subtitle">{{ loan.type }} | {{ loan.amount }}</div>
                  <div class="item-note">Repayment: {{ loan.repayment }}</div>
                </div>
                <span class="badge new">{{ loan.status }}</span>
              </div>
            }
          </div>
        </article>
      </section>

      <section class="mini-grid">
        @for (item of service.salaryStructures(); track item.id) {
          <article class="tile-card">
            <div class="item-title">{{ item.title }}</div>
            <p class="item-note" style="margin-top: 10px;">{{ item.description }}</p>
          </article>
        }
      </section>
    </div>
  `,
  styles: [
    WORKSPACE_STYLES,
    `
      .request-form-card {
        background: rgba(239, 246, 255, 0.6);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 20px;
        padding: 20px;
        margin-bottom: 18px;
      }

      .request-form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
        margin-top: 14px;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-field span {
        font-size: 13px;
        font-weight: 600;
        color: #475569;
      }

      .form-field input,
      .form-field select {
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 12px;
        padding: 12px 14px;
        background: #fff;
        font: inherit;
        color: #0f172a;
      }

      .form-field-wide {
        grid-column: 1 / -1;
      }

      .form-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 14px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesWorkspaceComponent {
  private authService = inject(AuthService);
  protected service = inject(FrappeHrService);
  protected expenseCategories = ['Travel', 'Food', 'Accommodation', 'Internet', 'Office Supplies', 'Client Meeting'];
  protected expenseReasons = [
    'Client visit reimbursement',
    'Work from home support',
    'Office purchase',
    'Project delivery expense',
    'Training or event participation',
  ];
  protected paymentModes: Array<'Cash' | 'Bank Transfer' | 'Payroll Reimbursement'> = ['Cash', 'Bank Transfer', 'Payroll Reimbursement'];
  protected claimCategory = 'Travel';
  protected claimAmount = '';
  protected claimLinkedTo = '';
  protected claimReason = 'Client visit reimbursement';
  protected claimPaymentMode: 'Cash' | 'Bank Transfer' | 'Payroll Reimbursement' = 'Cash';

  constructor() {
    this.service.loadWorkspace();
  }

  protected isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  protected currentEmployeeName(): string {
    const user = this.authService.user();
    return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  }

  protected submitExpenseClaim(): void {
    if (!this.claimAmount) {
      return;
    }

    this.service.submitExpenseClaim({
      category: this.claimCategory,
      amount: `Rs. ${this.claimAmount}`,
      linkedTo: this.claimLinkedTo,
      reason: this.claimReason,
      paymentMode: this.claimPaymentMode,
    });
    this.claimAmount = '';
    this.claimLinkedTo = '';
  }
}
