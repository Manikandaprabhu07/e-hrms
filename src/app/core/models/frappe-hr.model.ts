export type WorkspaceStatus = 'existing' | 'new' | 'planned';

export interface HrWorkspaceSection {
  id: string;
  title: string;
  description: string;
  route: string;
  metricLabel: string;
  metricValue: string;
  capabilities: string[];
  status: WorkspaceStatus;
}

export interface HrCoverageItem {
  category: string;
  feature: string;
  coverage: WorkspaceStatus;
  notes: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  openings: number;
  applicants: number;
  stage: 'Open' | 'Interviewing' | 'Offer' | 'Closed';
}

export interface Applicant {
  id: string;
  name: string;
  role: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired';
  source: string;
  score: number;
  interviewer: string;
}

export interface InterviewPlan {
  id: string;
  candidate: string;
  role: string;
  round: string;
  schedule: string;
  panel: string;
}

export interface OnboardingTask {
  id: string;
  employee: string;
  activity: string;
  owner: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
}

export interface EmployeeTransition {
  id: string;
  employee: string;
  changeType: 'Promotion' | 'Transfer' | 'Confirmation';
  effectiveDate: string;
  owner: string;
  status: 'Draft' | 'Ready' | 'Completed';
}

export interface SeparationCase {
  id: string;
  employee: string;
  department: string;
  relievingDate: string;
  checklistProgress: string;
  status: 'In Progress' | 'Exit Interview' | 'Closed';
}

export interface ShiftTemplate {
  id: string;
  name: string;
  timing: string;
  weeklyOff: string;
  team: string;
}

export interface ShiftAssignment {
  id: string;
  employee: string;
  shiftName: string;
  period: string;
  status: 'Active' | 'Upcoming';
}

export interface ShiftRequest {
  id: string;
  employeeId?: string;
  employee: string;
  requestedShift: string;
  dates: string;
  shiftDate?: string;
  reason?: string;
  approver: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface ExpenseClaim {
  id: string;
  employeeId?: string;
  employee: string;
  category: string;
  amount: string;
  submittedOn: string;
  linkedTo: string;
  reason?: string;
  paymentMode?: 'Cash' | 'Bank Transfer' | 'Payroll Reimbursement';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
}

export interface SalaryStructureItem {
  id: string;
  title: string;
  description: string;
}

export interface LoanAdvanceItem {
  id: string;
  employee: string;
  type: 'Loan' | 'Salary Advance';
  amount: string;
  repayment: string;
  status: 'Review' | 'Approved';
}

export interface ReportLibraryItem {
  id: string;
  title: string;
  description: string;
  audience: string;
  route: string;
  cadence: string;
}

export interface HrWorkspacePayload {
  id: string;
  brandName: string;
  sections: HrWorkspaceSection[];
  coverage: HrCoverageItem[];
  jobOpenings: JobOpening[];
  applicants: Applicant[];
  interviewPlans: InterviewPlan[];
  onboardingTasks: OnboardingTask[];
  transitions: EmployeeTransition[];
  separationCases: SeparationCase[];
  shiftTemplates: ShiftTemplate[];
  shiftAssignments: ShiftAssignment[];
  shiftRequests: ShiftRequest[];
  expenseClaims: ExpenseClaim[];
  salaryStructures: SalaryStructureItem[];
  loans: LoanAdvanceItem[];
  reports: ReportLibraryItem[];
}
