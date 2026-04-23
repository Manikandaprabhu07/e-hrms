"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payroll_entity_1 = require("./entities/payroll.entity");
const employee_entity_1 = require("../employees/entities/employee.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const XLSX = __importStar(require("xlsx"));
let PayrollService = class PayrollService {
    constructor(payrollRepository, employeesRepository, notificationsService) {
        this.payrollRepository = payrollRepository;
        this.employeesRepository = employeesRepository;
        this.notificationsService = notificationsService;
    }
    findAll() {
        return this.payrollRepository.find({ relations: ['employee'], order: { createdAt: 'DESC' } });
    }
    async findForUser(userId) {
        const employee = await this.employeesRepository.findOne({ where: { userId } });
        if (!employee) {
            throw new common_1.NotFoundException('Employee record not found for this user.');
        }
        return this.payrollRepository.find({
            where: { employee: { id: employee.id } },
            relations: ['employee'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const record = await this.payrollRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!record) {
            throw new common_1.NotFoundException(`Payroll record with ID ${id} not found`);
        }
        return record;
    }
    async createForEmployee(input) {
        if (!input.employeeId) {
            throw new common_1.BadRequestException('employeeId is required');
        }
        const employee = await this.employeesRepository.findOne({ where: { id: input.employeeId } });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${input.employeeId} not found`);
        }
        const metrics = this.buildPayrollMetrics(input, employee);
        const record = this.payrollRepository.create();
        record.employee = employee;
        record.month = String(input.month || '');
        record.year = Number(input.year || new Date().getFullYear());
        record.basicSalary = metrics.basicSalary;
        record.allowances = metrics.allowances;
        record.deductions = metrics.deductions;
        record.netSalary = metrics.netSalary;
        record.paymentStatus = input.paymentStatus || 'Pending';
        record.paymentDate = input.paymentDate ? new Date(input.paymentDate) : null;
        const saved = await this.payrollRepository.save(record);
        if (employee.userId) {
            await this.notificationsService.createForUser({
                userId: employee.userId,
                type: 'payroll',
                title: 'Payroll updated',
                message: `Your payroll for ${record.month} ${record.year} has been added/updated.`,
                link: '/payroll',
                meta: { payrollId: saved.id },
            });
        }
        return saved;
    }
    async update(id, payrollData) {
        const existing = await this.findOne(id);
        const employee = existing.employee;
        const patch = { ...payrollData };
        if (employee && (payrollData.aiAutoCalculate ||
            payrollData.basicSalary !== undefined ||
            payrollData.allowances !== undefined ||
            payrollData.deductions !== undefined ||
            payrollData.netSalary !== undefined)) {
            const metrics = this.buildPayrollMetrics({
                basicSalary: payrollData.basicSalary ?? existing.basicSalary,
                allowances: payrollData.allowances ?? existing.allowances,
                deductions: payrollData.deductions ?? existing.deductions,
                netSalary: payrollData.netSalary,
                aiAutoCalculate: payrollData.aiAutoCalculate,
            }, employee);
            patch.basicSalary = metrics.basicSalary;
            patch.allowances = metrics.allowances;
            patch.deductions = metrics.deductions;
            patch.netSalary = metrics.netSalary;
        }
        delete patch.aiAutoCalculate;
        await this.payrollRepository.update(id, patch);
        const updated = await this.findOne(id);
        const updatedEmployee = updated.employee;
        if (updatedEmployee?.userId) {
            await this.notificationsService.createForUser({
                userId: updatedEmployee.userId,
                type: 'payroll',
                title: 'Payroll updated',
                message: `Your payroll for ${updated.month} ${updated.year} has been updated.`,
                link: '/payroll',
                meta: { payrollId: updated.id },
            });
        }
        return updated;
    }
    async remove(id) {
        await this.payrollRepository.delete(id);
    }
    uploadPreview(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('Please upload an Excel file.');
        }
        const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        if (!sheet) {
            throw new common_1.BadRequestException('The uploaded workbook does not contain a readable sheet.');
        }
        const rows = XLSX.utils.sheet_to_json(sheet, {
            defval: '',
            raw: false,
        });
        return rows
            .map((row, index) => this.mapImportRow(row, index))
            .filter((row) => row !== null);
    }
    async saveImportedPayroll(rows) {
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new common_1.BadRequestException('No payroll rows were provided for import.');
        }
        let saved = 0;
        let skipped = 0;
        for (const row of rows) {
            const normalized = this.normalizeImportedPayrollRow(row);
            if (!normalized) {
                skipped += 1;
                continue;
            }
            const employee = await this.employeesRepository.findOne({
                where: [
                    { employeeId: normalized.employeeId },
                    { id: normalized.employeeId },
                ],
            });
            if (!employee) {
                skipped += 1;
                continue;
            }
            const existing = await this.payrollRepository.findOne({
                where: {
                    employee: { id: employee.id },
                    month: normalized.month,
                    year: normalized.year,
                },
                relations: ['employee'],
            });
            const metrics = this.buildPayrollMetrics(normalized, employee);
            if (existing) {
                existing.basicSalary = metrics.basicSalary;
                existing.allowances = metrics.allowances;
                existing.deductions = metrics.deductions;
                existing.netSalary = metrics.netSalary;
                existing.paymentStatus = normalized.paymentStatus;
                existing.paymentDate = normalized.paymentDate ? new Date(normalized.paymentDate) : null;
                await this.payrollRepository.save(existing);
            }
            else {
                await this.createForEmployee({
                    employeeId: employee.id,
                    month: normalized.month,
                    year: normalized.year,
                    basicSalary: metrics.basicSalary,
                    allowances: metrics.allowances,
                    deductions: metrics.deductions,
                    netSalary: metrics.netSalary,
                    paymentStatus: normalized.paymentStatus,
                    paymentDate: normalized.paymentDate,
                });
            }
            saved += 1;
        }
        return {
            message: 'Payroll imported successfully.',
            saved,
            skipped,
        };
    }
    mapImportRow(row, index) {
        return this.normalizeImportedPayrollRow({
            employeeId: this.stringValue(row['Employee ID']),
            month: this.stringValue(row['Month']),
            year: row['Year'] || new Date().getFullYear(),
            basicSalary: row['Basic Salary'],
            allowances: row['Allowances'],
            deductions: row['Deductions'],
            paymentStatus: this.stringValue(row['Payment Status']),
            paymentDate: row['Payment Date'],
            rowNumber: index + 2,
        });
    }
    normalizeImportedPayrollRow(input) {
        const employeeId = this.stringValue(input?.employeeId);
        const month = this.stringValue(input?.month);
        const year = Number(input?.year || new Date().getFullYear());
        if (!employeeId || !month || !Number.isFinite(year)) {
            return null;
        }
        const basicSalary = this.numberValue(input?.basicSalary);
        const hasAllowances = input?.allowances !== '' && input?.allowances !== null && input?.allowances !== undefined;
        const allowances = hasAllowances ? this.numberValue(input?.allowances) : Math.round(basicSalary * 0.2);
        const hasDeductions = input?.deductions !== '' && input?.deductions !== null && input?.deductions !== undefined;
        const deductions = hasDeductions ? this.numberValue(input?.deductions) : Math.round((basicSalary + allowances) * 0.08);
        const netSalary = Math.max(0, basicSalary + allowances - deductions);
        return {
            employeeId,
            month,
            year,
            basicSalary,
            allowances,
            deductions,
            netSalary,
            paymentStatus: this.stringValue(input?.paymentStatus) || 'Pending',
            paymentDate: this.normalizeDateString(input?.paymentDate),
            aiInsight: hasAllowances && hasDeductions
                ? 'Imported with provided values.'
                : 'AI payroll assistant filled missing allowances and deductions.',
        };
    }
    buildPayrollMetrics(input, employee) {
        const aiAutoCalculate = Boolean(input?.aiAutoCalculate);
        const employeeSalary = Number(employee?.salary || 0);
        const baseSalary = Number(input?.basicSalary ?? employeeSalary ?? 0);
        const basicSalary = Number.isFinite(baseSalary) ? baseSalary : 0;
        const allowances = aiAutoCalculate
            ? Math.round(basicSalary * 0.2)
            : this.numberValue(input?.allowances);
        const deductions = aiAutoCalculate
            ? Math.round((basicSalary + allowances) * 0.08)
            : this.numberValue(input?.deductions);
        const netSalary = Number(input?.netSalary ?? (basicSalary + allowances - deductions));
        return {
            basicSalary,
            allowances,
            deductions,
            netSalary: Math.max(0, Number.isFinite(netSalary) ? netSalary : 0),
        };
    }
    stringValue(value) {
        return String(value ?? '').trim();
    }
    numberValue(value) {
        if (value === null || value === undefined || value === '') {
            return 0;
        }
        const parsed = Number(String(value).replace(/,/g, ''));
        return Number.isFinite(parsed) ? parsed : 0;
    }
    normalizeDateString(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const parsed = new Date(String(value));
        if (Number.isNaN(parsed.getTime())) {
            return null;
        }
        return parsed.toISOString().split('T')[0];
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payroll_entity_1.Payroll)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map