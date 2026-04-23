import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, FrappeHrService } from '../../core/services';
import { WORKSPACE_STYLES } from './workspace.styles';

@Component({
  selector: 'app-recruitment-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-shell">
      <section class="hero">
        <span class="eyebrow">Recruitment</span>
        <h1>Talent and Hiring Desk</h1>
        <p>
          Manage job openings, applicant pipeline, interview planning, and offer readiness so
          hiring stays inside your HR system.
        </p>
      </section>

      <section class="stats-grid">
        @for (stat of service.recruitmentStats(); track stat.label) {
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
              <h2>Job openings</h2>
              <p class="item-note">Department-wise vacancy planning.</p>
            </div>
            @if (isAdmin()) {
              <button class="report-link" (click)="toggleJobForm()">
                {{ showJobForm() ? 'Cancel' : 'Add job opening' }}
              </button>
            }
          </div>

          @if (showJobForm()) {
            <div class="form-card">
              <div class="form-title">{{ editingJobId() ? 'Edit job opening' : 'Create new job opening' }}</div>
              <div class="form-grid">
                <label class="form-field form-field-full">
                  <span>Job Title</span>
                  <input [(ngModel)]="jobForm.title" type="text" placeholder="e.g., Senior Developer" required />
                </label>
                <label class="form-field">
                  <span>Department</span>
                  <select [(ngModel)]="jobForm.department">
                    <option value="">Select Department</option>
                    @for (dept of departments; track dept) {
                      <option [value]="dept">{{ dept }}</option>
                    }
                  </select>
                </label>
                <label class="form-field">
                  <span>Location</span>
                  <input [(ngModel)]="jobForm.location" type="text" placeholder="e.g., New York" />
                </label>
                <label class="form-field">
                  <span>Number of Openings</span>
                  <input [(ngModel)]="jobForm.openings" type="number" min="1" placeholder="1" />
                </label>
                <label class="form-field form-field-full">
                  <span>Description</span>
                  <textarea [(ngModel)]="jobForm.description" placeholder="Job description, requirements, etc."></textarea>
                </label>
              </div>
              <div class="form-actions">
                <button class="action-button primary" (click)="saveJob()">
                  {{ editingJobId() ? 'Update' : 'Create' }} Job Opening
                </button>
                <button class="action-button secondary" (click)="cancelJobForm()">Cancel</button>
              </div>
            </div>
          }

          <div class="list">
            @for (job of service.jobOpenings(); track job.id) {
              <div class="list-item">
                <div class="item-main">
                  <div class="item-title">{{ job.title }}</div>
                  <div class="item-subtitle">{{ job.department }} | {{ job.location }}</div>
                  <div class="item-meta">
                    <span class="chip">{{ job.openings }} openings</span>
                    <span class="chip">{{ job.applicants }} applicants</span>
                  </div>
                  @if (job.description) {
                    <p class="item-note" style="margin-top: 8px;">{{ job.description }}</p>
                  }
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                  <span class="badge new">{{ job.stage }}</span>
                  @if (isAdmin()) {
                    <button class="action-button secondary" (click)="editJob(job)">Edit</button>
                    <button class="action-button secondary" (click)="deleteJob(job.id)" style="color: #ef4444;">Delete</button>
                  }
                </div>
              </div>
            }
          </div>
        </article>

        <!-- Job Roles Section -->
        <article class="list-card">
          <div class="list-card-header">
            <div>
              <h2>Job Roles</h2>
              <p class="item-note">Designations and roles used across the organization.</p>
            </div>
            @if (isAdmin()) {
              <button class="report-link" (click)="toggleRoleForm()">
                {{ showRoleForm() ? 'Cancel' : 'Add job role' }}
              </button>
            }
          </div>

          @if (showRoleForm()) {
            <div class="form-card">
              <div class="form-title">{{ editingRoleId() ? 'Edit job role' : 'Create new job role' }}</div>
              <div class="form-grid">
                <label class="form-field form-field-full">
                  <span>Role Name</span>
                  <input [(ngModel)]="roleForm.name" type="text" placeholder="e.g., Senior Developer" required />
                </label>
                <label class="form-field">
                  <span>Department</span>
                  <select [(ngModel)]="roleForm.department">
                    <option value="">Select Department</option>
                    @for (dept of departments; track dept) {
                      <option [value]="dept">{{ dept }}</option>
                    }
                  </select>
                </label>
                <label class="form-field form-field-full">
                  <span>Description</span>
                  <textarea [(ngModel)]="roleForm.description" placeholder="Role description and responsibilities"></textarea>
                </label>
              </div>
              <div class="form-actions">
                <button class="action-button primary" (click)="saveRole()">
                  {{ editingRoleId() ? 'Update' : 'Create' }} Job Role
                </button>
                <button class="action-button secondary" (click)="cancelRoleForm()">Cancel</button>
              </div>
            </div>
          }

          <div class="list">
            @for (role of service.jobRoles(); track role.id) {
              <div class="list-item">
                <div class="item-main">
                  <div class="item-title">{{ role.name }}</div>
                  <div class="item-subtitle">{{ role.department || 'All Departments' }}</div>
                  @if (role.description) {
                    <p class="item-note" style="margin-top: 8px;">{{ role.description }}</p>
                  }
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                  <span class="badge" [class.new]="role.isActive" [class.existing]="!role.isActive">
                    {{ role.isActive ? 'Active' : 'Inactive' }}
                  </span>
                  @if (isAdmin()) {
                    <button class="action-button secondary" (click)="editRole(role)">Edit</button>
                    <button class="action-button secondary" (click)="deleteRole(role.id)" style="color: #ef4444;">Delete</button>
                  }
                </div>
              </div>
            }
          </div>
        </article>
      </section>

      <section class="section-grid">
        <article class="list-card">
          <div class="list-card-header">
            <div>
              <h2>Applicant pipeline</h2>
              <p class="item-note">Move candidates across the hiring funnel.</p>
            </div>
          </div>

          <div class="list">
            @for (applicant of service.applicants(); track applicant.id) {
              <div class="list-item">
                <div class="item-main">
                  <div class="item-title">{{ applicant.name }}</div>
                  <div class="item-subtitle">{{ applicant.role }} | {{ applicant.source }}</div>
                  <div class="item-meta">
                    <span class="chip">Score {{ applicant.score }}</span>
                    <span class="chip">{{ applicant.interviewer }}</span>
                  </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:10px;">
                  <span class="badge new">{{ applicant.stage }}</span>
                  @if (applicant.stage !== 'Hired' && isAdmin()) {
                    <button class="action-button secondary" (click)="service.advanceApplicant(applicant.id)">
                      Advance stage
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </article>
      </section>

      <section class="list-card">
        <div class="list-card-header">
          <div>
            <h2>Interview plan</h2>
            <p class="item-note">Structured interview rounds, panels, and schedule visibility.</p>
          </div>
          @if (isAdmin()) {
            <button class="report-link" (click)="toggleInterviewForm()">
              {{ showInterviewForm() ? 'Cancel' : 'Schedule interview' }}
            </button>
          }
        </div>

        @if (showInterviewForm()) {
          <div class="form-card">
            <div class="form-title">{{ editingInterviewId() ? 'Edit interview' : 'Schedule new interview' }}</div>
            <div class="form-grid">
              <label class="form-field form-field-full">
                <span>Candidate Name</span>
                <input [(ngModel)]="interviewForm.candidate" type="text" placeholder="e.g., John Doe" required />
              </label>
              <label class="form-field">
                <span>Role</span>
                <input [(ngModel)]="interviewForm.role" type="text" placeholder="e.g., Senior Developer" />
              </label>
              <label class="form-field">
                <span>Round</span>
                <select [(ngModel)]="interviewForm.round">
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                  <option value="Manager">Manager</option>
                  <option value="Final">Final</option>
                </select>
              </label>
              <label class="form-field form-field-full">
                <span>Schedule</span>
                <input [(ngModel)]="interviewForm.schedule" type="datetime-local" />
              </label>
              <label class="form-field form-field-full">
                <span>Panel</span>
                <input [(ngModel)]="interviewForm.panel" type="text" placeholder="e.g., John, Sarah, Mike" />
              </label>
            </div>
            <div class="form-actions">
              <button class="action-button primary" (click)="saveInterview()">
                {{ editingInterviewId() ? 'Update' : 'Schedule' }} Interview
              </button>
              <button class="action-button secondary" (click)="cancelInterviewForm()">Cancel</button>
            </div>
          </div>
        }

        <div class="list">
          @for (interview of service.interviewPlans(); track interview.id) {
            <div class="list-item">
              <div class="item-main">
                <div class="item-title">{{ interview.candidate }}</div>
                <div class="item-subtitle">{{ interview.role }} | {{ interview.round }}</div>
                <div class="item-note">{{ interview.schedule }} with {{ interview.panel }}</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                <span class="badge existing">Scheduled</span>
                @if (isAdmin()) {
                  <button class="action-button secondary" (click)="editInterview(interview)">Edit</button>
                  <button class="action-button secondary" (click)="deleteInterview(interview.id)" style="color: #ef4444;">Delete</button>
                }
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    WORKSPACE_STYLES,
    `
      .form-card {
        background: rgba(239, 246, 255, 0.6);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 20px;
        padding: 20px;
        margin-bottom: 18px;
      }

      .form-title {
        font-size: 16px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 16px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
        margin-bottom: 14px;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-field-full {
        grid-column: 1 / -1;
      }

      .form-field span {
        font-size: 13px;
        font-weight: 600;
        color: #475569;
      }

      .form-field input,
      .form-field select,
      .form-field textarea {
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 12px;
        padding: 12px 14px;
        background: #fff;
        font: inherit;
        color: #0f172a;
        font-family: inherit;
      }

      .form-field textarea {
        resize: vertical;
        min-height: 100px;
      }

      .form-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecruitmentWorkspaceComponent {
  private authService = inject(AuthService);
  protected service = inject(FrappeHrService);

  protected showJobForm = signal(false);
  protected editingJobId = signal<string | null>(null);

  protected showRoleForm = signal(false);
  protected editingRoleId = signal<string | null>(null);

  protected showInterviewForm = signal(false);
  protected editingInterviewId = signal<string | null>(null);

  protected jobForm = {
    title: '',
    department: '',
    location: '',
    openings: 1,
    description: ''
  };

  protected roleForm = {
    name: '',
    department: '',
    description: ''
  };

  protected interviewForm = {
    candidate: '',
    role: '',
    round: 'Technical',
    schedule: '',
    panel: ''
  };

  protected departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'Operations',
    'HR',
    'Finance',
    'Customer Success',
    'Product'
  ];

  constructor() {
    this.service.loadWorkspace();
    this.service.loadJobRoles();
  }

  protected isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  // Job Opening Methods
  protected toggleJobForm(): void {
    this.showJobForm.update(v => !v);
    if (!this.showJobForm()) {
      this.resetJobForm();
    }
  }

  protected cancelJobForm(): void {
    this.showJobForm.set(false);
    this.resetJobForm();
  }

  protected resetJobForm(): void {
    this.jobForm = { title: '', department: '', location: '', openings: 1, description: '' };
    this.editingJobId.set(null);
  }

  protected editJob(job: any): void {
    this.jobForm = {
      title: job.title,
      department: job.department,
      location: job.location || '',
      openings: job.openings || 1,
      description: job.description || ''
    };
    this.editingJobId.set(job.id);
    this.showJobForm.set(true);
  }

  protected saveJob(): void {
    if (!this.jobForm.title || !this.jobForm.department) {
      alert('Please fill in all required fields');
      return;
    }

    const jobData = {
      title: this.jobForm.title,
      department: this.jobForm.department,
      location: this.jobForm.location,
      openings: this.jobForm.openings,
      description: this.jobForm.description
    };

    if (this.editingJobId()) {
      this.service.updateJobOpening(this.editingJobId()!, jobData).then(
        () => {
          this.cancelJobForm();
        },
        (error) => {
          alert('Failed to update job opening: ' + error.message);
        }
      );
    } else {
      this.service.createJobOpening(jobData).then(
        () => {
          this.cancelJobForm();
        },
        (error) => {
          alert('Failed to create job opening: ' + error.message);
        }
      );
    }
  }

  protected deleteJob(jobId: string): void {
    if (confirm('Are you sure you want to delete this job opening?')) {
      this.service.deleteJobOpening(jobId).then(
        () => {
          console.log('Job opening deleted');
        },
        (error) => {
          alert('Failed to delete job opening: ' + error.message);
        }
      );
    }
  }

  // Job Role Methods
  protected toggleRoleForm(): void {
    this.showRoleForm.update(v => !v);
    if (!this.showRoleForm()) {
      this.resetRoleForm();
    }
  }

  protected cancelRoleForm(): void {
    this.showRoleForm.set(false);
    this.resetRoleForm();
  }

  protected resetRoleForm(): void {
    this.roleForm = { name: '', department: '', description: '' };
    this.editingRoleId.set(null);
  }

  protected editRole(role: any): void {
    this.roleForm = {
      name: role.name,
      department: role.department || '',
      description: role.description || ''
    };
    this.editingRoleId.set(role.id);
    this.showRoleForm.set(true);
  }

  protected saveRole(): void {
    if (!this.roleForm.name) {
      alert('Please enter a role name');
      return;
    }

    const roleData = {
      name: this.roleForm.name,
      department: this.roleForm.department || undefined,
      description: this.roleForm.description || undefined
    };

    if (this.editingRoleId()) {
      this.service.updateJobRole(this.editingRoleId()!, roleData).then(
        () => {
          this.cancelRoleForm();
        },
        (error) => {
          alert('Failed to update job role: ' + error.message);
        }
      );
    } else {
      this.service.createJobRole(roleData).then(
        () => {
          this.cancelRoleForm();
        },
        (error) => {
          alert('Failed to create job role: ' + error.message);
        }
      );
    }
  }

  protected deleteRole(roleId: string): void {
    if (confirm('Are you sure you want to delete this job role?')) {
      this.service.deleteJobRole(roleId).then(
        () => {
          console.log('Job role deleted');
        },
        (error) => {
          alert('Failed to delete job role: ' + error.message);
        }
      );
    }
  }

  // Interview Plan Methods
  protected toggleInterviewForm(): void {
    this.showInterviewForm.update(v => !v);
    if (!this.showInterviewForm()) {
      this.resetInterviewForm();
    }
  }

  protected cancelInterviewForm(): void {
    this.showInterviewForm.set(false);
    this.resetInterviewForm();
  }

  protected resetInterviewForm(): void {
    this.interviewForm = { candidate: '', role: '', round: 'Technical', schedule: '', panel: '' };
    this.editingInterviewId.set(null);
  }

  protected editInterview(interview: any): void {
    this.interviewForm = {
      candidate: interview.candidate,
      role: interview.role || '',
      round: interview.round || 'Technical',
      schedule: interview.schedule || '',
      panel: interview.panel || ''
    };
    this.editingInterviewId.set(interview.id);
    this.showInterviewForm.set(true);
  }

  protected saveInterview(): void {
    if (!this.interviewForm.candidate) {
      alert('Please enter candidate name');
      return;
    }

    // For now, we'll store interview plans in the workspace snapshot
    // This would need a proper API endpoint in a real implementation
    alert('Interview scheduling feature - API endpoint needs to be implemented in hr-operations service');
    this.cancelInterviewForm();
  }

  protected deleteInterview(interviewId: string): void {
    if (confirm('Are you sure you want to delete this interview plan?')) {
      // Would need API endpoint
      alert('Interview deletion feature - API endpoint needs to be implemented');
    }
  }
}
