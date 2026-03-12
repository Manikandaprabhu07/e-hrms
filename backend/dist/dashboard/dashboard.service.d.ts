import { Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { Leave } from '../leave/entities/leave.entity';
export declare class DashboardService {
    private employeesRepository;
    private leaveRepository;
    constructor(employeesRepository: Repository<Employee>, leaveRepository: Repository<Leave>);
    private getQuarterRange;
    getAdminDashboard(): Promise<{
        totals: {
            totalEmployees: number;
            newHiresThisYear: number;
            exitsThisYear: number;
            employeesJoiningThisQuarter: number;
            employeesRelievingThisQuarter: number;
        };
        departmentCounts: any[];
        ageBuckets: {
            '18-25': number;
            '26-35': number;
            '36-45': number;
            '46-55': number;
            '56+': number;
        };
        pendingLeaveRequests: Leave[];
    }>;
    getEmployeeDashboard(employeeId: string): Promise<{
        leaveSummary: {
            pending: number;
            approved: number;
            rejected: number;
        };
    }>;
}
