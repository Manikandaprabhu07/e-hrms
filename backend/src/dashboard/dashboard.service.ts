import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Repository } from 'typeorm';
import { Employee, EmployeeStatus } from '../employees/entities/employee.entity';
import { Leave } from '../leave/entities/leave.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        @InjectRepository(Leave)
        private leaveRepository: Repository<Leave>,
    ) { }

    private getQuarterRange(date: Date) {
        const quarter = Math.floor(date.getMonth() / 3);
        const start = new Date(date.getFullYear(), quarter * 3, 1);
        const end = new Date(date.getFullYear(), quarter * 3 + 3, 0);
        return { start, end };
    }

    async getAdminDashboard() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const { start: startOfQuarter, end: endOfQuarter } = this.getQuarterRange(now);

        const totalEmployees = await this.employeesRepository.count();
        const newHiresThisYear = await this.employeesRepository.count({
            where: { dateOfJoining: MoreThanOrEqual(startOfYear) }
        });

        const exitsThisYear = await this.employeesRepository.count({
            where: {
                employmentStatus: In([EmployeeStatus.RESIGNED, EmployeeStatus.TERMINATED]),
                dateOfResignation: MoreThanOrEqual(startOfYear)
            }
        });

        const employeesJoiningThisQuarter = await this.employeesRepository.count({
            where: { dateOfJoining: Between(startOfQuarter, endOfQuarter) }
        });

        const employeesRelievingThisQuarter = await this.employeesRepository.count({
            where: {
                employmentStatus: In([EmployeeStatus.RESIGNED, EmployeeStatus.TERMINATED]),
                dateOfResignation: Between(startOfQuarter, endOfQuarter)
            }
        });

        const pendingLeaveRequests = await this.leaveRepository.find({
            where: { status: 'Pending' },
            take: 5,
            order: { createdAt: 'DESC' },
        });

        const departmentCounts = await this.employeesRepository
            .createQueryBuilder('employee')
            .select('employee.department', 'department')
            .addSelect('COUNT(*)', 'count')
            .groupBy('employee.department')
            .getRawMany();

        const ageBuckets = {
            '18-25': 0,
            '26-35': 0,
            '36-45': 0,
            '46-55': 0,
            '56+': 0,
        };

        const employeesWithDob = await this.employeesRepository
            .createQueryBuilder('employee')
            .where('employee.dateOfBirth IS NOT NULL')
            .getMany();
        const currentYear = now.getFullYear();
        employeesWithDob.forEach((emp) => {
            if (!emp.dateOfBirth) return;
            const age = currentYear - new Date(emp.dateOfBirth).getFullYear();
            if (age <= 25) ageBuckets['18-25'] += 1;
            else if (age <= 35) ageBuckets['26-35'] += 1;
            else if (age <= 45) ageBuckets['36-45'] += 1;
            else if (age <= 55) ageBuckets['46-55'] += 1;
            else ageBuckets['56+'] += 1;
        });

        return {
            totals: {
                totalEmployees,
                newHiresThisYear,
                exitsThisYear,
                employeesJoiningThisQuarter,
                employeesRelievingThisQuarter,
            },
            departmentCounts,
            ageBuckets,
            pendingLeaveRequests,
        };
    }

    async getEmployeeDashboard(employeeId: string) {
        const pendingLeaves = await this.leaveRepository.count({
            where: { employee: { id: employeeId } as any, status: 'Pending' }
        });
        const approvedLeaves = await this.leaveRepository.count({
            where: { employee: { id: employeeId } as any, status: 'Approved' }
        });
        const rejectedLeaves = await this.leaveRepository.count({
            where: { employee: { id: employeeId } as any, status: 'Rejected' }
        });

        return {
            leaveSummary: {
                pending: pendingLeaves,
                approved: approvedLeaves,
                rejected: rejectedLeaves,
            },
        };
    }
}
