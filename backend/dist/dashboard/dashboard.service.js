"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../employees/entities/employee.entity");
const leave_entity_1 = require("../leave/entities/leave.entity");
let DashboardService = class DashboardService {
    employeesRepository;
    leaveRepository;
    constructor(employeesRepository, leaveRepository) {
        this.employeesRepository = employeesRepository;
        this.leaveRepository = leaveRepository;
    }
    getQuarterRange(date) {
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
            where: { dateOfJoining: (0, typeorm_2.MoreThanOrEqual)(startOfYear) }
        });
        const exitsThisYear = await this.employeesRepository.count({
            where: {
                employmentStatus: (0, typeorm_2.In)([employee_entity_1.EmployeeStatus.RESIGNED, employee_entity_1.EmployeeStatus.TERMINATED]),
                dateOfResignation: (0, typeorm_2.MoreThanOrEqual)(startOfYear)
            }
        });
        const employeesJoiningThisQuarter = await this.employeesRepository.count({
            where: { dateOfJoining: (0, typeorm_2.Between)(startOfQuarter, endOfQuarter) }
        });
        const employeesRelievingThisQuarter = await this.employeesRepository.count({
            where: {
                employmentStatus: (0, typeorm_2.In)([employee_entity_1.EmployeeStatus.RESIGNED, employee_entity_1.EmployeeStatus.TERMINATED]),
                dateOfResignation: (0, typeorm_2.Between)(startOfQuarter, endOfQuarter)
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
            if (!emp.dateOfBirth)
                return;
            const age = currentYear - new Date(emp.dateOfBirth).getFullYear();
            if (age <= 25)
                ageBuckets['18-25'] += 1;
            else if (age <= 35)
                ageBuckets['26-35'] += 1;
            else if (age <= 45)
                ageBuckets['36-45'] += 1;
            else if (age <= 55)
                ageBuckets['46-55'] += 1;
            else
                ageBuckets['56+'] += 1;
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
    async getEmployeeDashboard(employeeId) {
        const pendingLeaves = await this.leaveRepository.count({
            where: { employee: { id: employeeId }, status: 'Pending' }
        });
        const approvedLeaves = await this.leaveRepository.count({
            where: { employee: { id: employeeId }, status: 'Approved' }
        });
        const rejectedLeaves = await this.leaveRepository.count({
            where: { employee: { id: employeeId }, status: 'Rejected' }
        });
        return {
            leaveSummary: {
                pending: pendingLeaves,
                approved: approvedLeaves,
                rejected: rejectedLeaves,
            },
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(leave_entity_1.Leave)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map