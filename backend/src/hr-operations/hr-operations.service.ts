import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrWorkspaceSnapshot } from './entities/hr-workspace-snapshot.entity';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class HrOperationsService {
  constructor(
    @InjectRepository(HrWorkspaceSnapshot)
    private readonly snapshotRepository: Repository<HrWorkspaceSnapshot>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  async getWorkspace() {
    const snapshot = await this.ensureSnapshot();
    return this.syncSnapshotWithEmployees(snapshot);
  }

  async advanceApplicant(id: string) {
    const snapshot = await this.ensureSnapshot();
    const nextStage: Record<string, string> = {
      Applied: 'Screening',
      Screening: 'Interview',
      Interview: 'Offer',
      Offer: 'Hired',
      Hired: 'Hired',
    };

    let found = false;
    snapshot.applicants = snapshot.applicants.map((item) => {
      if (item.id !== id) return item;
      found = true;
      return {
        ...item,
        stage: nextStage[item.stage] || item.stage,
        score: Math.min((item.score || 0) + 2, 99),
      };
    });

    if (!found) throw new NotFoundException('Applicant not found.');
    return this.snapshotRepository.save(snapshot);
  }

  async completeOnboardingTask(id: string) {
    const snapshot = await this.ensureSnapshot();
    let found = false;
    snapshot.onboardingTasks = snapshot.onboardingTasks.map((item) => {
      if (item.id !== id) return item;
      found = true;
      return { ...item, status: 'Completed' };
    });
    if (!found) throw new NotFoundException('Onboarding task not found.');
    return this.snapshotRepository.save(snapshot);
  }

  async closeSeparation(id: string) {
    const snapshot = await this.ensureSnapshot();
    let found = false;
    snapshot.separationCases = snapshot.separationCases.map((item) => {
      if (item.id !== id) return item;
      found = true;
      return { ...item, status: 'Closed', checklistProgress: '5/5' };
    });
    if (!found) throw new NotFoundException('Separation case not found.');
    return this.snapshotRepository.save(snapshot);
  }

  async updateShiftRequestStatus(id: string, status: 'Approved' | 'Rejected') {
    const snapshot = await this.syncSnapshotWithEmployees(await this.ensureSnapshot());
    const request = snapshot.shiftRequests.find((item) => item.id === id);
    if (!request) throw new NotFoundException('Shift request not found.');

    snapshot.shiftRequests = snapshot.shiftRequests.map((item) =>
      item.id === id ? { ...item, status } : item,
    );

    if (status === 'Approved') {
      snapshot.shiftAssignments = [
        {
          id: `asg-${snapshot.shiftAssignments.length + 1}`,
          employeeId: request.employeeId,
          employee: request.employee,
          shiftName: request.requestedShift,
          period: request.dates,
          status: 'Upcoming',
        },
        ...snapshot.shiftAssignments,
      ];
    }

    return this.snapshotRepository.save(snapshot);
  }

  async updateExpenseStatus(id: string, status: string) {
    const snapshot = await this.syncSnapshotWithEmployees(await this.ensureSnapshot());
    let found = false;
    snapshot.expenseClaims = snapshot.expenseClaims.map((item) => {
      if (item.id !== id) return item;
      found = true;
      return { ...item, status };
    });
    if (!found) throw new NotFoundException('Expense claim not found.');
    return this.snapshotRepository.save(snapshot);
  }

  // Interview Plan CRUD
  async createInterviewPlan(data: {
    candidate: string;
    role?: string;
    round?: string;
    schedule?: string;
    panel?: string;
  }) {
    const snapshot = await this.ensureSnapshot();
    const newInterview = {
      id: `int-${Date.now()}`,
      candidate: data.candidate,
      role: data.role || '',
      round: data.round || 'Technical',
      schedule: data.schedule || new Date().toLocaleString(),
      panel: data.panel || 'Admin',
    };
    snapshot.interviewPlans = [newInterview, ...(snapshot.interviewPlans || [])];
    return this.snapshotRepository.save(snapshot);
  }

  async updateInterviewPlan(id: string, data: {
    candidate?: string;
    role?: string;
    round?: string;
    schedule?: string;
    panel?: string;
  }) {
    const snapshot = await this.ensureSnapshot();
    let found = false;
    snapshot.interviewPlans = snapshot.interviewPlans.map((item) => {
      if (item.id !== id) return item;
      found = true;
      return { ...item, ...data };
    });
    if (!found) throw new NotFoundException('Interview plan not found.');
    return this.snapshotRepository.save(snapshot);
  }

  async deleteInterviewPlan(id: string) {
    const snapshot = await this.ensureSnapshot();
    const initialLength = snapshot.interviewPlans.length;
    snapshot.interviewPlans = snapshot.interviewPlans.filter((item) => item.id !== id);
    if (snapshot.interviewPlans.length === initialLength) {
      throw new NotFoundException('Interview plan not found.');
    }
    return this.snapshotRepository.save(snapshot);
  }

  // Shift Template CRUD
  async createShiftTemplate(data: {
    name: string;
    timing?: string;
    team?: string;
    weeklyOff?: string;
  }) {
    const snapshot = await this.ensureSnapshot();
    const newTemplate = {
      id: `shift-${Date.now()}`,
      name: data.name,
      timing: data.timing || '09:00 AM - 06:00 PM',
      team: data.team || 'General',
      weeklyOff: data.weeklyOff || 'Sunday',
    };
    snapshot.shiftTemplates = [newTemplate, ...(snapshot.shiftTemplates || [])];
    return this.snapshotRepository.save(snapshot);
  }

  async updateShiftTemplate(id: string, data: {
    name?: string;
    timing?: string;
    team?: string;
    weeklyOff?: string;
  }) {
    const snapshot = await this.ensureSnapshot();
    let found = false;
    snapshot.shiftTemplates = snapshot.shiftTemplates.map((item) => {
      if (item.id !== id) return item;
      found = true;
      return { ...item, ...data };
    });
    if (!found) throw new NotFoundException('Shift template not found.');
    return this.snapshotRepository.save(snapshot);
  }

  async deleteShiftTemplate(id: string) {
    const snapshot = await this.ensureSnapshot();
    const initialLength = snapshot.shiftTemplates.length;
    snapshot.shiftTemplates = snapshot.shiftTemplates.filter((item) => item.id !== id);
    if (snapshot.shiftTemplates.length === initialLength) {
      throw new NotFoundException('Shift template not found.');
    }
    return this.snapshotRepository.save(snapshot);
  }

  // Transition CRUD
  async createTransition(data: {
    employeeId?: string;
    employee?: string;
    changeType?: string;
    effectiveDate?: string;
    owner?: string;
  }) {
    const snapshot = await this.syncSnapshotWithEmployees(await this.ensureSnapshot());
    const employee = data.employeeId 
      ? await this.employeesRepository.findOne({ where: { id: data.employeeId } })
      : null;
    
    const newTransition = {
      id: `trans-${Date.now()}`,
      employeeId: data.employeeId || employee?.id || '',
      employee: data.employee || (employee ? this.employeeName(employee) : 'Unknown'),
      changeType: data.changeType || 'Promotion',
      effectiveDate: data.effectiveDate || new Date().toLocaleDateString(),
      owner: data.owner || 'HR Admin',
      status: 'Pending',
    };
    snapshot.transitions = [newTransition, ...(snapshot.transitions || [])];
    return this.snapshotRepository.save(snapshot);
  }

  async updateTransition(id: string, data: {
    changeType?: string;
    effectiveDate?: string;
    status?: string;
    owner?: string;
  }) {
    const snapshot = await this.ensureSnapshot();
    let found = false;
    snapshot.transitions = snapshot.transitions.map((item) => {
      if (item.id !== id) return item;
      found = true;
      return { ...item, ...data };
    });
    if (!found) throw new NotFoundException('Transition not found.');
    return this.snapshotRepository.save(snapshot);
  }

  async deleteTransition(id: string) {
    const snapshot = await this.ensureSnapshot();
    const initialLength = snapshot.transitions.length;
    snapshot.transitions = snapshot.transitions.filter((item) => item.id !== id);
    if (snapshot.transitions.length === initialLength) {
      throw new NotFoundException('Transition not found.');
    }
    return this.snapshotRepository.save(snapshot);
  }

  async submitShiftRequestForUser(
    userId: string,
    body: { requestedShift?: string; dates?: string; shiftDate?: string; reason?: string },
  ) {
    const snapshot = await this.syncSnapshotWithEmployees(await this.ensureSnapshot());
    const employee = await this.findEmployeeByUserId(userId);
    const shiftDate = body.shiftDate || '';

    snapshot.shiftRequests = [
      {
        id: `req-${Date.now()}`,
        employeeId: employee.id,
        employee: this.employeeName(employee),
        requestedShift: body.requestedShift || 'General Shift',
        dates: body.dates || (shiftDate ? `Requested for ${shiftDate}` : 'Requested period'),
        shiftDate,
        reason: body.reason || 'Work schedule adjustment',
        approver: 'Admin Desk',
        status: 'Pending',
      },
      ...snapshot.shiftRequests,
    ];

    return this.snapshotRepository.save(snapshot);
  }

  async submitExpenseClaimForUser(
    userId: string,
    body: {
      category?: string;
      amount?: string;
      linkedTo?: string;
      reason?: string;
      paymentMode?: 'Cash' | 'Bank Transfer' | 'Payroll Reimbursement';
    },
  ) {
    const snapshot = await this.syncSnapshotWithEmployees(await this.ensureSnapshot());
    const employee = await this.findEmployeeByUserId(userId);

    snapshot.expenseClaims = [
      {
        id: `exp-${Date.now()}`,
        employeeId: employee.id,
        employee: this.employeeName(employee),
        category: body.category || 'General Reimbursement',
        amount: body.amount || 'Rs. 0',
        submittedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        linkedTo: body.linkedTo || employee.department || 'General',
        reason: body.reason || 'Business expense',
        paymentMode: body.paymentMode || 'Cash',
        status: 'Pending',
      },
      ...snapshot.expenseClaims,
    ];

    return this.snapshotRepository.save(snapshot);
  }

  private async ensureSnapshot(): Promise<HrWorkspaceSnapshot> {
    let snapshot = await this.snapshotRepository.findOne({ where: {} });
    if (!snapshot) {
      snapshot = this.snapshotRepository.create(this.buildDefaultSnapshot());
      snapshot = await this.snapshotRepository.save(snapshot);
    }
    return snapshot;
  }

  private async syncSnapshotWithEmployees(snapshot: HrWorkspaceSnapshot): Promise<HrWorkspaceSnapshot> {
    const employees = await this.employeesRepository.find({
      order: { createdAt: 'ASC' },
    });

    if (employees.length === 0) {
      return snapshot;
    }

    const pick = (index: number) => employees[index % employees.length];
    const assignEmployee = (item: any, employee: Employee) => ({
      ...item,
      employeeId: employee.id,
      employee: this.employeeName(employee),
      department: item.department || employee.department,
      designation: item.designation || employee.designation,
    });

    snapshot.shiftAssignments = (snapshot.shiftAssignments || []).map((item: any, index: number) =>
      assignEmployee(item, this.resolveEmployee(item.employeeId, employees) || pick(index)),
    );

    snapshot.shiftRequests = (snapshot.shiftRequests || []).map((item: any, index: number) => ({
      ...assignEmployee(item, this.resolveEmployee(item.employeeId, employees) || pick(index + 1)),
      approver: 'Admin Desk',
    }));

    snapshot.expenseClaims = (snapshot.expenseClaims || []).map((item: any, index: number) =>
      assignEmployee(item, this.resolveEmployee(item.employeeId, employees) || pick(index + 2)),
    );

    snapshot.onboardingTasks = (snapshot.onboardingTasks || []).map((item: any, index: number) => ({
      ...item,
      employeeId: (this.resolveEmployee(item.employeeId, employees) || pick(index)).id,
      employee: this.employeeName(this.resolveEmployee(item.employeeId, employees) || pick(index)),
    }));

    snapshot.transitions = (snapshot.transitions || []).map((item: any, index: number) => ({
      ...item,
      employeeId: (this.resolveEmployee(item.employeeId, employees) || pick(index + 1)).id,
      employee: this.employeeName(this.resolveEmployee(item.employeeId, employees) || pick(index + 1)),
    }));

    snapshot.separationCases = (snapshot.separationCases || []).map((item: any, index: number) => {
      const employee = this.resolveEmployee(item.employeeId, employees) || pick(index + 2);
      return {
        ...item,
        employeeId: employee.id,
        employee: this.employeeName(employee),
        department: employee.department,
      };
    });

    snapshot.sections = (snapshot.sections || []).map((section: any) => {
      if (section.id === 'shifts') {
        return { ...section, metricValue: `${snapshot.shiftAssignments.length} scheduled` };
      }
      if (section.id === 'expenses') {
        return { ...section, metricValue: `${snapshot.expenseClaims.length} this month` };
      }
      return section;
    });

    return snapshot;
  }

  private resolveEmployee(employeeId: string | undefined, employees: Employee[]): Employee | undefined {
    return employeeId ? employees.find((employee) => employee.id === employeeId) : undefined;
  }

  private employeeName(employee: Employee): string {
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email;
  }

  private async findEmployeeByUserId(userId: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({ where: { userId } });
    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user.');
    }
    return employee;
  }

  private buildDefaultSnapshot(): Partial<HrWorkspaceSnapshot> {
    return {
      brandName: 'E-HRMS',
      sections: [
        {
          id: 'workspace',
          title: 'Workspace',
          description: 'A unified launchpad for recruitment, lifecycle, schedules, expenses, and reports.',
          route: '/hr',
          metricLabel: 'Coverage',
          metricValue: '14 workflows',
          capabilities: ['Feature map', 'Workflow groups', 'Operational visibility'],
          status: 'new',
        },
        {
          id: 'recruitment',
          title: 'Recruitment',
          description: 'Job openings, applicants, interviews, and hiring progress.',
          route: '/hr/recruitment',
          metricLabel: 'Open roles',
          metricValue: '5 active',
          capabilities: ['Job openings', 'Applicant stages', 'Interview tracker'],
          status: 'new',
        },
        {
          id: 'lifecycle',
          title: 'Employee Lifecycle',
          description: 'Onboarding, promotions, transfers, confirmation, and separations.',
          route: '/hr/lifecycle',
          metricLabel: 'Tasks',
          metricValue: '18 tracked',
          capabilities: ['Onboarding', 'Transitions', 'Exit checklist'],
          status: 'new',
        },
        {
          id: 'shifts',
          title: 'Shift Management',
          description: 'Shift types, recurring rosters, assignments, and requests.',
          route: '/hr/shifts',
          metricLabel: 'Assignments',
          metricValue: '26 scheduled',
          capabilities: ['Shift templates', 'Assignments', 'Shift requests'],
          status: 'new',
        },
        {
          id: 'expenses',
          title: 'Expense Claims',
          description: 'Reimbursements, advances, and payroll-linked payout readiness.',
          route: '/hr/expenses',
          metricLabel: 'Claims',
          metricValue: '9 this month',
          capabilities: ['Expense approval', 'Loans and advances', 'Payout view'],
          status: 'new',
        },
        {
          id: 'reports',
          title: 'People Reports',
          description: 'Operational reports for leave, attendance, payroll, hiring, and compliance.',
          route: '/hr/reports',
          metricLabel: 'Reports',
          metricValue: '12 ready',
          capabilities: ['Attendance reports', 'Leave balance', 'Workforce reporting'],
          status: 'new',
        },
      ],
      coverage: [
        { category: 'Core HR', feature: 'Employee master and profiles', coverage: 'existing', notes: 'Connected to your employee module.' },
        { category: 'Core HR', feature: 'Attendance and leave management', coverage: 'existing', notes: 'Connected to current modules.' },
        { category: 'Core HR', feature: 'Payroll and training', coverage: 'existing', notes: 'Connected to current modules.' },
        { category: 'Recruitment', feature: 'Job openings and applicant pipeline', coverage: 'new', notes: 'Now stored in the backend workspace store.' },
        { category: 'Recruitment', feature: 'Interview planning and offer readiness', coverage: 'new', notes: 'Now stored in the backend workspace store.' },
        { category: 'Employee Lifecycle', feature: 'Employee onboarding templates and tasks', coverage: 'new', notes: 'Now stored in the backend workspace store.' },
        { category: 'Employee Lifecycle', feature: 'Promotion, transfer, and confirmation', coverage: 'new', notes: 'Now stored in the backend workspace store.' },
        { category: 'Employee Lifecycle', feature: 'Separation and exit checklist', coverage: 'new', notes: 'Now stored in the backend workspace store.' },
        { category: 'Shift Management', feature: 'Shift types, schedule, and requests', coverage: 'new', notes: 'Now stored in the backend workspace store.' },
        { category: 'Expense Claims', feature: 'Claims, approvals, and payouts', coverage: 'new', notes: 'Now stored in the backend workspace store.' },
        { category: 'Reporting', feature: 'Attendance, leave, salary, and hiring reports', coverage: 'new', notes: 'Available through the operations hub.' },
      ],
      jobOpenings: [
        { id: 'job-1', title: 'Senior Angular Developer', department: 'Engineering', location: 'Chennai', openings: 2, applicants: 18, stage: 'Interviewing' },
        { id: 'job-2', title: 'HR Operations Executive', department: 'People Ops', location: 'Coimbatore', openings: 1, applicants: 9, stage: 'Offer' },
        { id: 'job-3', title: 'Payroll Specialist', department: 'Finance', location: 'Remote', openings: 1, applicants: 7, stage: 'Open' },
      ],
      applicants: [
        { id: 'app-1', name: 'Ananya Raj', role: 'Senior Angular Developer', stage: 'Interview', source: 'LinkedIn', score: 88, interviewer: 'Karthik S' },
        { id: 'app-2', name: 'Vikram Das', role: 'Payroll Specialist', stage: 'Screening', source: 'Referral', score: 81, interviewer: 'Divya R' },
        { id: 'app-3', name: 'Megha Nair', role: 'HR Operations Executive', stage: 'Offer', source: 'Careers Page', score: 92, interviewer: 'Priya M' },
      ],
      interviewPlans: [
        { id: 'int-1', candidate: 'Ananya Raj', role: 'Senior Angular Developer', round: 'Technical Round 2', schedule: 'Apr 02, 11:00 AM', panel: 'Frontend Lead, Architect' },
        { id: 'int-2', candidate: 'Vikram Das', role: 'Payroll Specialist', round: 'HR Screening', schedule: 'Apr 03, 02:30 PM', panel: 'People Ops' },
        { id: 'int-3', candidate: 'Megha Nair', role: 'HR Operations Executive', round: 'Offer Review', schedule: 'Apr 04, 04:00 PM', panel: 'HR Head, Finance' },
      ],
      onboardingTasks: [
        { id: 'onb-1', employee: 'Rhea Menon', activity: 'Create work email and HRMS login', owner: 'IT Admin', dueDate: 'Apr 02', status: 'Pending' },
        { id: 'onb-2', employee: 'Rhea Menon', activity: 'Issue ID card and access badge', owner: 'Admin Team', dueDate: 'Apr 02', status: 'Completed' },
        { id: 'onb-3', employee: 'Imran Ali', activity: 'Upload KYC and bank documents', owner: 'Employee', dueDate: 'Apr 03', status: 'Pending' },
      ],
      transitions: [
        { id: 'tr-1', employee: 'Asha Krishnan', changeType: 'Promotion', effectiveDate: 'Apr 08', owner: 'People Ops', status: 'Ready' },
        { id: 'tr-2', employee: 'Naveen Kumar', changeType: 'Transfer', effectiveDate: 'Apr 15', owner: 'Business HR', status: 'Draft' },
        { id: 'tr-3', employee: 'Farah Khan', changeType: 'Confirmation', effectiveDate: 'Apr 05', owner: 'Manager', status: 'Completed' },
      ],
      separationCases: [
        { id: 'sep-1', employee: 'Deepak Raman', department: 'Engineering', relievingDate: 'Apr 19', checklistProgress: '3/5', status: 'In Progress' },
        { id: 'sep-2', employee: 'Swetha Paul', department: 'Finance', relievingDate: 'Apr 11', checklistProgress: '4/5', status: 'Exit Interview' },
      ],
      shiftTemplates: [
        { id: 'shift-1', name: 'General Shift', timing: '09:30 AM - 06:30 PM', weeklyOff: 'Sunday', team: 'Corporate' },
        { id: 'shift-2', name: 'Support Shift A', timing: '07:00 AM - 04:00 PM', weeklyOff: 'Saturday', team: 'Support' },
        { id: 'shift-3', name: 'Night Operations', timing: '10:00 PM - 06:00 AM', weeklyOff: 'Rotational', team: 'Operations' },
      ],
      shiftAssignments: [
        { id: 'asg-1', employee: 'Arun K', shiftName: 'General Shift', period: 'Apr 01 - Apr 30', status: 'Active' },
        { id: 'asg-2', employee: 'Nisha P', shiftName: 'Support Shift A', period: 'Apr 01 - Apr 15', status: 'Active' },
        { id: 'asg-3', employee: 'Joel S', shiftName: 'Night Operations', period: 'Apr 08 - Apr 22', status: 'Upcoming' },
      ],
      shiftRequests: [
        {
          id: 'req-1',
          employee: 'Nisha P',
          requestedShift: 'General Shift',
          dates: 'Apr 10 - Apr 20',
          shiftDate: '2026-04-10',
          reason: 'Personal schedule change',
          approver: 'Ravi T',
          status: 'Pending',
        },
        {
          id: 'req-2',
          employee: 'Joel S',
          requestedShift: 'Support Shift A',
          dates: 'Apr 12 - Apr 19',
          shiftDate: '2026-04-12',
          reason: 'Team coverage support',
          approver: 'Ravi T',
          status: 'Pending',
        },
      ],
      expenseClaims: [
        {
          id: 'exp-1',
          employee: 'Akhil M',
          category: 'Client Travel',
          amount: 'Rs. 6,500',
          submittedOn: 'Mar 29',
          linkedTo: 'Project Orion',
          reason: 'Client visit reimbursement',
          paymentMode: 'Cash',
          status: 'Pending',
        },
        {
          id: 'exp-2',
          employee: 'Rhea Menon',
          category: 'Internet Reimbursement',
          amount: 'Rs. 1,200',
          submittedOn: 'Mar 27',
          linkedTo: 'Remote Work',
          reason: 'Monthly work-from-home internet bill',
          paymentMode: 'Bank Transfer',
          status: 'Approved',
        },
        {
          id: 'exp-3',
          employee: 'Divya R',
          category: 'Hiring Drive',
          amount: 'Rs. 4,850',
          submittedOn: 'Mar 25',
          linkedTo: 'Campus Hiring',
          reason: 'Venue and hiring event spend',
          paymentMode: 'Payroll Reimbursement',
          status: 'Paid',
        },
      ],
      salaryStructures: [
        { id: 'sal-1', title: 'Salary Structure Templates', description: 'Map base pay, allowances, deductions, and employer contributions.' },
        { id: 'sal-2', title: 'Flexible Benefits', description: 'Track benefit buckets and claim-backed reimbursements.' },
        { id: 'sal-3', title: 'Payroll Payout Readiness', description: 'Surface approved claims and approved advances before payroll run.' },
      ],
      loans: [
        { id: 'loan-1', employee: 'Kiran V', type: 'Salary Advance', amount: 'Rs. 15,000', repayment: '3 months', status: 'Review' },
        { id: 'loan-2', employee: 'Priya M', type: 'Loan', amount: 'Rs. 80,000', repayment: '12 months', status: 'Approved' },
      ],
      reports: [
        { id: 'rep-1', title: 'Monthly Attendance Sheet', description: 'Department-wise presence, absence, leave, holiday, and unmarked days.', audience: 'HR Ops', route: '/attendance', cadence: 'Monthly' },
        { id: 'rep-2', title: 'Employee Leave Balance', description: 'Remaining leave by employee, leave type, and approval stage.', audience: 'Managers', route: '/leave', cadence: 'Weekly' },
        { id: 'rep-3', title: 'Salary Register', description: 'Gross pay, deductions, employer cost, and net pay summary.', audience: 'Payroll', route: '/payroll', cadence: 'Monthly' },
        { id: 'rep-4', title: 'Hiring Funnel', description: 'Openings, source mix, interview conversion, and offer outcomes.', audience: 'Talent', route: '/hr/recruitment', cadence: 'Weekly' },
        { id: 'rep-5', title: 'Onboarding Tracker', description: 'Joining readiness, incomplete activities, and owner bottlenecks.', audience: 'People Ops', route: '/hr/lifecycle', cadence: 'Daily' },
        { id: 'rep-6', title: 'Expense Approval Register', description: 'Submitted, approved, rejected, and paid claims with project linkage.', audience: 'Finance', route: '/hr/expenses', cadence: 'Weekly' },
      ],
    };
  }
}
