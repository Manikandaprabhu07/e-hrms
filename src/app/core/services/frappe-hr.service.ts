import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface WorkspaceStat {
  label: string;
  value: string | number;
}

export interface ExpenseClaim {
  id: string;
  employee: string;
  category: string;
  amount: string | number;
  submittedOn: string;
  paymentMode?: string;
  reason?: string;
  linkedTo: string;
  status: string;
}

export interface OnboardingTask {
  id: string;
  employee: string;
  activity: string;
  owner: string;
  dueDate: string;
  status: string;
}

export interface Transition {
  id: string;
  employee: string;
  changeType: string;
  effectiveDate: string;
  owner: string;
  status: string;
}

export interface SeparationCase {
  id: string;
  employee: string;
  department: string;
  relievingDate: string;
  checklistProgress: string;
  status: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  openings: number;
  applicants: number;
  stage: string;
  description?: string;
  status?: string;
}

export interface Applicant {
  id: string;
  name: string;
  role: string;
  source: string;
  score: number;
  interviewer: string;
  stage: string;
}

export interface JobRole {
  id: string;
  name: string;
  description?: string;
  department?: string;
  isActive: boolean;
}

export interface InterviewPlan {
  id: string;
  candidate: string;
  role: string;
  round: string;
  schedule: string;
  panel: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  timing: string;
  team: string;
  weeklyOff: string;
}

export interface ShiftAssignment {
  id: string;
  employee: string;
  shiftName: string;
  period: string;
  status: string;
}

export interface ShiftRequest {
  id: string;
  employee: string;
  requestedShift: string;
  shiftDate?: string;
  dates?: string;
  reason?: string;
  approver: string;
  status: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  cadence: string;
  audience: string;
  route: string;
}

export interface Loan {
  id: string;
  employee: string;
  type: string;
  amount: number;
  repayment: string;
  status: string;
}

export interface SalaryStructure {
  id: string;
  title: string;
  description: string;
}

export interface WorkspaceSection {
  id: string;
  title: string;
  description: string;
  status: string;
  metricLabel: string;
  metricValue: string | number;
  route: string;
  capabilities: string[];
}

export interface Coverage {
  category: string;
  feature: string;
  coverage: string;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class FrappeHrService {
  private http = inject(HttpClient);
  private apiUrl = '/api/hr-operations';

  // Expense Workspace Signals
  expenseStats = signal<WorkspaceStat[]>([]);
  expenseClaims = signal<ExpenseClaim[]>([]);
  loans = signal<Loan[]>([]);
  salaryStructures = signal<SalaryStructure[]>([]);

  // HR Workspace Signals
  overviewStats = signal<WorkspaceStat[]>([]);
  coverage = signal<Coverage[]>([]);
  sections = signal<WorkspaceSection[]>([]);

  // Lifecycle Workspace Signals
  lifecycleStats = signal<WorkspaceStat[]>([]);
  onboardingTasks = signal<OnboardingTask[]>([]);
  transitions = signal<Transition[]>([]);
  separationCases = signal<SeparationCase[]>([]);

  // Recruitment Workspace Signals
  recruitmentStats = signal<WorkspaceStat[]>([]);
  jobOpenings = signal<JobOpening[]>([]);
  applicants = signal<Applicant[]>([]);
  jobRoles = signal<JobRole[]>([]);
  interviewPlans = signal<InterviewPlan[]>([]);

  // Reports Workspace Signals
  reportStats = signal<WorkspaceStat[]>([]);
  reports = signal<Report[]>([]);

  // Shifts Workspace Signals
  shiftStats = signal<WorkspaceStat[]>([]);
  shiftTemplates = signal<ShiftTemplate[]>([]);
  shiftAssignments = signal<ShiftAssignment[]>([]);
  shiftRequests = signal<ShiftRequest[]>([]);

  loadWorkspace(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${this.apiUrl}/workspace`).subscribe({
        next: (data) => {
          // Map backend data to frontend signals
          this.mapWorkspaceData(data);
          resolve();
        },
        error: (error) => {
          console.error('Failed to load workspace:', error);
          reject(error);
        }
      });
    });
  }

  private mapWorkspaceData(data: any): void {
    // Expense Workspace
    this.expenseStats.set(this.buildExpenseStats(data));
    this.expenseClaims.set(data.expenseClaims || []);
    this.loans.set(data.loans || []);
    this.salaryStructures.set(data.salaryStructures || []);

    // HR Workspace
    this.overviewStats.set(this.buildOverviewStats(data));
    this.coverage.set(data.coverage || []);
    this.sections.set(this.buildSections(data));

    // Lifecycle Workspace
    this.lifecycleStats.set(this.buildLifecycleStats(data));
    this.onboardingTasks.set(data.onboardingTasks || []);
    this.transitions.set(data.transitions || []);
    this.separationCases.set(data.separationCases || []);

    // Recruitment Workspace
    this.recruitmentStats.set(this.buildRecruitmentStats(data));
    this.jobOpenings.set(data.jobOpenings || []);
    this.applicants.set(data.applicants || []);
    this.interviewPlans.set(data.interviewPlans || []);

    // Reports Workspace
    this.reportStats.set(this.buildReportStats(data));
    this.reports.set(data.reports || []);

    // Shifts Workspace
    this.shiftStats.set(this.buildShiftStats(data));
    this.shiftTemplates.set(data.shiftTemplates || []);
    this.shiftAssignments.set(data.shiftAssignments || []);
    this.shiftRequests.set(data.shiftRequests || []);
  }

  private buildExpenseStats(data: any): WorkspaceStat[] {
    const expenseClaims = data.expenseClaims || [];
    const loans = data.loans || [];
    const pending = expenseClaims.filter((c: any) => c.status === 'Pending').length;
    const approved = expenseClaims.filter((c: any) => c.status === 'Approved').length;
    const loanCount = loans.length;

    return [
      { label: 'Pending claims', value: pending },
      { label: 'Approved claims', value: approved },
      { label: 'Active loans', value: loanCount }
    ];
  }

  private buildOverviewStats(data: any): WorkspaceStat[] {
    return [
      { label: 'Pending requests', value: 12 },
      { label: 'Active processes', value: 8 },
      { label: 'Completed this month', value: 25 }
    ];
  }

  private buildLifecycleStats(data: any): WorkspaceStat[] {
    const onboarding = (data.onboardingTasks || []).filter((t: any) => t.status !== 'Completed').length;
    const separations = (data.separationCases || []).filter((s: any) => s.status !== 'Closed').length;

    return [
      { label: 'Pending onboarding', value: onboarding },
      { label: 'Open separations', value: separations },
      { label: 'Active transitions', value: (data.transitions || []).length }
    ];
  }

  private buildRecruitmentStats(data: any): WorkspaceStat[] {
    const openings = data.jobOpenings || [];
    const applicants = data.applicants || [];
    const screeningCount = applicants.filter((a: any) => a.stage === 'Screening').length;

    return [
      { label: 'Open positions', value: openings.length },
      { label: 'Total applicants', value: applicants.length },
      { label: 'In screening', value: screeningCount }
    ];
  }

  private buildReportStats(data: any): WorkspaceStat[] {
    const reports = data.reports || [];

    return [
      { label: 'Total reports', value: reports.length },
      { label: 'Generated this month', value: 5 },
      { label: 'Active subscriptions', value: 3 }
    ];
  }

  private buildShiftStats(data: any): WorkspaceStat[] {
    const assignments = data.shiftAssignments || [];
    const requests = data.shiftRequests || [];
    const pendingRequests = requests.filter((r: any) => r.status === 'Pending').length;

    return [
      { label: 'Active assignments', value: assignments.length },
      { label: 'Pending requests', value: pendingRequests },
      { label: 'Shift templates', value: (data.shiftTemplates || []).length }
    ];
  }

  private buildSections(data: any): WorkspaceSection[] {
    return [
      {
        id: 'recruitment',
        title: 'Recruitment',
        description: 'Manage job openings and applicant pipeline',
        status: 'active',
        metricLabel: 'Open positions',
        metricValue: (data.jobOpenings || []).length,
        route: '/hr/recruitment',
        capabilities: ['Job Openings', 'Applicants', 'Interviews']
      },
      {
        id: 'lifecycle',
        title: 'Employee Lifecycle',
        description: 'Onboarding, transitions, and separations',
        status: 'active',
        metricLabel: 'Pending tasks',
        metricValue: (data.onboardingTasks || []).filter((t: any) => t.status !== 'Completed').length,
        route: '/hr/lifecycle',
        capabilities: ['Onboarding', 'Transitions', 'Separations']
      },
      {
        id: 'shifts',
        title: 'Shift Management',
        description: 'Shift templates, assignments, and requests',
        status: 'active',
        metricLabel: 'Active assignments',
        metricValue: (data.shiftAssignments || []).length,
        route: '/hr/shifts',
        capabilities: ['Shift Templates', 'Assignments', 'Requests']
      },
      {
        id: 'expenses',
        title: 'Expense Claims',
        description: 'Reimbursements, loans, and payroll payouts',
        status: 'active',
        metricLabel: 'Pending claims',
        metricValue: (data.expenseClaims || []).filter((c: any) => c.status === 'Pending').length,
        route: '/hr/expenses',
        capabilities: ['Claims', 'Loans', 'Salary Structures']
      },
      {
        id: 'reports',
        title: 'Reports',
        description: 'Operational and compliance reporting',
        status: 'active',
        metricLabel: 'Total reports',
        metricValue: (data.reports || []).length,
        route: '/hr/reports',
        capabilities: ['Attendance', 'Leave', 'Payroll']
      }
    ];
  }

  // Expense Methods
  updateExpenseStatus(claimId: string, status: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.patch<void>(`${this.apiUrl}/expenses/${claimId}/status`, { status }).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to update expense status:', error);
          reject(error);
        }
      });
    });
  }

  submitExpenseClaim(data: Partial<ExpenseClaim>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<void>(`${this.apiUrl}/expenses`, {
        category: data.category,
        amount: data.amount,
        linkedTo: data.linkedTo,
        reason: data.reason,
        paymentMode: (data as any).paymentMode
      }).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to submit expense claim:', error);
          reject(error);
        }
      });
    });
  }

  // Lifecycle Methods
  completeOnboardingTask(taskId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.patch<void>(`${this.apiUrl}/onboarding/${taskId}/complete`, {}).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to complete onboarding task:', error);
          reject(error);
        }
      });
    });
  }

  closeSeparation(caseId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.patch<void>(`${this.apiUrl}/separation/${caseId}/close`, {}).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to close separation:', error);
          reject(error);
        }
      });
    });
  }

  // Recruitment Methods
  advanceApplicant(applicantId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.patch<void>(`${this.apiUrl}/applicants/${applicantId}/advance`, {}).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to advance applicant:', error);
          reject(error);
        }
      });
    });
  }

  // Shift Methods
  updateShiftRequestStatus(requestId: string, status: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.patch<void>(`${this.apiUrl}/shift-requests/${requestId}/status`, { status }).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to update shift request status:', error);
          reject(error);
        }
      });
    });
  }

  submitShiftRequest(data: Partial<ShiftRequest>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<void>(`${this.apiUrl}/shift-requests`, {
        requestedShift: data.requestedShift,
        dates: data.dates,
        shiftDate: data.shiftDate,
        reason: data.reason
      }).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to submit shift request:', error);
          reject(error);
        }
      });
    });
  }

  // Recruitment Methods
  createJobOpening(data: {
    title: string;
    department: string;
    location?: string;
    openings?: number;
    description?: string;
  }): Promise<JobOpening> {
    return new Promise((resolve, reject) => {
      const recruitment_apiUrl = '/api/recruitment';
      this.http.post<JobOpening>(`${recruitment_apiUrl}/openings`, {
        title: data.title,
        department: data.department,
        location: data.location,
        openings: data.openings || 1,
        description: data.description,
        status: 'Open'
      }).subscribe({
        next: (opening) => {
          this.loadWorkspace().then(() => resolve(opening)).catch(reject);
        },
        error: (error) => {
          console.error('Failed to create job opening:', error);
          reject(error);
        }
      });
    });
  }

  updateJobOpening(id: string, data: Partial<JobOpening>): Promise<JobOpening> {
    return new Promise((resolve, reject) => {
      const recruitment_apiUrl = '/api/recruitment';
      this.http.patch<JobOpening>(`${recruitment_apiUrl}/openings/${id}`, data).subscribe({
        next: (opening) => {
          this.loadWorkspace().then(() => resolve(opening)).catch(reject);
        },
        error: (error) => {
          console.error('Failed to update job opening:', error);
          reject(error);
        }
      });
    });
  }

  deleteJobOpening(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const recruitment_apiUrl = '/api/recruitment';
      this.http.delete<void>(`${recruitment_apiUrl}/openings/${id}`).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to delete job opening:', error);
          reject(error);
        }
      });
    });
  }

  // Job Role Methods
  loadJobRoles(): Promise<void> {
    return new Promise((resolve, reject) => {
      const recruitment_apiUrl = '/api/recruitment';
      this.http.get<JobRole[]>(`${recruitment_apiUrl}/job-roles`).subscribe({
        next: (roles) => {
          this.jobRoles.set(roles);
          resolve();
        },
        error: (error) => {
          console.error('Failed to load job roles:', error);
          reject(error);
        }
      });
    });
  }

  createJobRole(data: { name: string; description?: string; department?: string }): Promise<JobRole> {
    return new Promise((resolve, reject) => {
      const recruitment_apiUrl = '/api/recruitment';
      this.http.post<JobRole>(`${recruitment_apiUrl}/job-roles`, data).subscribe({
        next: (role) => {
          this.loadJobRoles().then(() => resolve(role)).catch(reject);
        },
        error: (error) => {
          console.error('Failed to create job role:', error);
          reject(error);
        }
      });
    });
  }

  updateJobRole(id: string, data: Partial<JobRole>): Promise<JobRole> {
    return new Promise((resolve, reject) => {
      const recruitment_apiUrl = '/api/recruitment';
      this.http.patch<JobRole>(`${recruitment_apiUrl}/job-roles/${id}`, data).subscribe({
        next: (role) => {
          this.loadJobRoles().then(() => resolve(role)).catch(reject);
        },
        error: (error) => {
          console.error('Failed to update job role:', error);
          reject(error);
        }
      });
    });
  }

  deleteJobRole(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const recruitment_apiUrl = '/api/recruitment';
      this.http.delete<void>(`${recruitment_apiUrl}/job-roles/${id}`).subscribe({
        next: () => {
          this.loadJobRoles().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to delete job role:', error);
          reject(error);
        }
      });
    });
  }

  // Interview Plan Methods
  createInterviewPlan(data: { candidate: string; role?: string; round?: string; schedule?: string; panel?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<void>(`${this.apiUrl}/interview-plans`, data).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to create interview plan:', error);
          reject(error);
        }
      });
    });
  }

  updateInterviewPlan(id: string, data: Partial<InterviewPlan>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.patch<void>(`${this.apiUrl}/interview-plans/${id}`, data).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to update interview plan:', error);
          reject(error);
        }
      });
    });
  }

  deleteInterviewPlan(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete<void>(`${this.apiUrl}/interview-plans/${id}`).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to delete interview plan:', error);
          reject(error);
        }
      });
    });
  }

  // Shift Template Methods
  createShiftTemplate(data: { name: string; timing?: string; team?: string; weeklyOff?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<void>(`${this.apiUrl}/shift-templates`, data).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to create shift template:', error);
          reject(error);
        }
      });
    });
  }

  updateShiftTemplate(id: string, data: Partial<ShiftTemplate>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.patch<void>(`${this.apiUrl}/shift-templates/${id}`, data).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to update shift template:', error);
          reject(error);
        }
      });
    });
  }

  deleteShiftTemplate(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete<void>(`${this.apiUrl}/shift-templates/${id}`).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to delete shift template:', error);
          reject(error);
        }
      });
    });
  }

  // Transition Methods
  createTransition(data: { employeeId?: string; employee?: string; changeType?: string; effectiveDate?: string; owner?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<void>(`${this.apiUrl}/transitions`, data).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to create transition:', error);
          reject(error);
        }
      });
    });
  }

  updateTransition(id: string, data: Partial<Transition>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.patch<void>(`${this.apiUrl}/transitions/${id}`, data).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to update transition:', error);
          reject(error);
        }
      });
    });
  }

  deleteTransition(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete<void>(`${this.apiUrl}/transitions/${id}`).subscribe({
        next: () => {
          this.loadWorkspace().then(resolve).catch(reject);
        },
        error: (error) => {
          console.error('Failed to delete transition:', error);
          reject(error);
        }
      });
    });
  }
}

