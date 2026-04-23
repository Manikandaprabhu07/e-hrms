import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, FrappeHrService } from '../../core/services';
import { WORKSPACE_STYLES } from './workspace.styles';

@Component({
  selector: 'app-shifts-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-shell">
      <section class="hero">
        <span class="eyebrow">Shift management</span>
        <h1>Rosters, assignments, and shift requests</h1>
        <p>
          Manage shift types, active assignments, and employee-requested schedule changes in one
          connected workflow.
        </p>
      </section>

      <section class="stats-grid">
        @for (stat of service.shiftStats(); track stat.label) {
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
              <h2>Shift templates</h2>
              <p class="item-note">Standard shifts for teams and departments.</p>
            </div>
            @if (isAdmin()) {
              <button class="report-link" (click)="toggleShiftTemplateForm()">
                {{ showShiftTemplateForm() ? 'Cancel' : 'Add template' }}
              </button>
            }
          </div>

          @if (showShiftTemplateForm()) {
            <div class="form-card">
              <div class="form-title">{{ editingShiftTemplateId() ? 'Edit shift template' : 'Create new shift template' }}</div>
              <div class="form-grid">
                <label class="form-field form-field-full">
                  <span>Template Name</span>
                  <input [(ngModel)]="shiftTemplateForm.name" type="text" placeholder="e.g., General Shift" required />
                </label>
                <label class="form-field">
                  <span>Timing</span>
                  <input [(ngModel)]="shiftTemplateForm.timing" type="text" placeholder="e.g., 09:00 AM - 06:00 PM" />
                </label>
                <label class="form-field">
                  <span>Team</span>
                  <input [(ngModel)]="shiftTemplateForm.team" type="text" placeholder="e.g., Engineering" />
                </label>
                <label class="form-field form-field-full">
                  <span>Weekly Off</span>
                  <select [(ngModel)]="shiftTemplateForm.weeklyOff">
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </label>
              </div>
              <div class="form-actions">
                <button class="action-button primary" (click)="saveShiftTemplate()">
                  {{ editingShiftTemplateId() ? 'Update' : 'Create' }} Template
                </button>
                <button class="action-button secondary" (click)="cancelShiftTemplateForm()">Cancel</button>
              </div>
            </div>
          }

          <div class="list">
            @for (shift of service.shiftTemplates(); track shift.id) {
              <div class="list-item">
                <div class="item-main">
                  <div class="item-title">{{ shift.name }}</div>
                  <div class="item-subtitle">{{ shift.timing }}</div>
                  <div class="item-meta">
                    <span class="chip">{{ shift.team }}</span>
                    <span class="chip">{{ shift.weeklyOff }}</span>
                  </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                  <span class="badge existing">Template</span>
                  @if (isAdmin()) {
                    <button class="action-button secondary" (click)="editShiftTemplate(shift)">Edit</button>
                    <button class="action-button secondary" (click)="deleteShiftTemplate(shift.id)" style="color: #ef4444;">Delete</button>
                  }
                </div>
              </div>
            }
          </div>
        </article>

        <article class="list-card">
          <div class="list-card-header">
            <div>
              <h2>Shift assignments</h2>
              <p class="item-note">Current and upcoming roster assignments.</p>
            </div>
          </div>

          <div class="list">
            @for (assignment of service.shiftAssignments(); track assignment.id) {
              <div class="list-item">
                <div class="item-main">
                  <div class="item-title">{{ assignment.employee }}</div>
                  <div class="item-subtitle">{{ assignment.shiftName }}</div>
                  <div class="item-note">{{ assignment.period }}</div>
                </div>
                <span class="badge new">{{ assignment.status }}</span>
              </div>
            }
          </div>
        </article>
      </section>

      <section class="list-card">
        <div class="list-card-header">
          <div>
            <h2>{{ isAdmin() ? 'Shift requests' : 'My shift requests' }}</h2>
            <p class="item-note">
              {{ isAdmin() ? 'Approve employee requests and turn them into assignments.' : 'Submit a shift change request for admin approval.' }}
            </p>
          </div>
        </div>

        @if (!isAdmin()) {
          <div class="request-form-card">
            <div class="item-main" style="width:100%;">
              <div class="item-title">Request a shift change</div>
              <p class="item-note">Choose a shift, select the date, and tell admin the reason.</p>
              <div class="request-form-grid">
                <label class="form-field">
                  <span>Requested shift</span>
                  <select [(ngModel)]="requestShiftName">
                    @for (option of shiftOptions; track option) {
                      <option [value]="option">{{ option }}</option>
                    }
                  </select>
                </label>
                <label class="form-field">
                  <span>Shift date</span>
                  <input [(ngModel)]="requestShiftDate" type="date" />
                </label>
                <label class="form-field form-field-wide">
                  <span>Reason</span>
                  <select [(ngModel)]="requestShiftReason">
                    @for (option of shiftReasons; track option) {
                      <option [value]="option">{{ option }}</option>
                    }
                  </select>
                </label>
              </div>
              <div class="form-actions">
                <button class="action-button primary" (click)="submitShiftRequest()">Submit request</button>
              </div>
            </div>
          </div>
        }

        <div class="list">
          @for (request of service.shiftRequests(); track request.id) {
            @if (isAdmin() || request.employee === currentEmployeeName()) {
              <div class="list-item">
              <div class="item-main">
                <div class="item-title">{{ request.employee }}</div>
                <div class="item-subtitle">{{ request.requestedShift }}</div>
                <div class="item-note">
                  {{ request.shiftDate || request.dates }} | {{ request.reason || 'No reason provided' }}
                </div>
                <div class="item-note">Approver: {{ request.approver }}</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:10px;">
                <span class="badge" [class.planned]="request.status === 'Pending'" [class.existing]="request.status === 'Approved'" [class.new]="request.status === 'Rejected'">
                  {{ request.status }}
                </span>
                @if (request.status === 'Pending' && isAdmin()) {
                  <div class="form-actions">
                    <button class="action-button secondary" (click)="service.updateShiftRequestStatus(request.id, 'Approved')">
                      Approve
                    </button>
                    <button class="action-button secondary danger" (click)="service.updateShiftRequestStatus(request.id, 'Rejected')">
                      Reject
                    </button>
                  </div>
                }
              </div>
              </div>
            }
          }
        </div>
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

      .danger {
        border-color: rgba(220, 38, 38, 0.22);
        color: #b91c1c;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShiftsWorkspaceComponent {
  private authService = inject(AuthService);
  protected service = inject(FrappeHrService);
  protected shiftOptions = ['General Shift', 'Support Shift A', 'Night Operations'];
  protected shiftReasons = [
    'Personal schedule change',
    'Medical need',
    'Team coverage support',
    'Transport issue',
    'Project workload change',
  ];
  protected requestShiftName = 'General Shift';
  protected requestShiftDate = '';
  protected requestShiftReason = 'Personal schedule change';

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

  protected submitShiftRequest(): void {
    if (!this.requestShiftDate) {
      return;
    }

    this.service.submitShiftRequest({
      requestedShift: this.requestShiftName,
      dates: `Requested for ${this.requestShiftDate}`,
      shiftDate: this.requestShiftDate,
      reason: this.requestShiftReason,
    });
    this.requestShiftDate = '';
  }
}
