import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from './entities/payroll.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import * as XLSX from 'xlsx';

@Injectable()
export class PayrollService {
    constructor(
        @InjectRepository(Payroll)
        private payrollRepository: Repository<Payroll>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        private notificationsService: NotificationsService,
    ) { }

    findAll(): Promise<Payroll[]> {
        return this.payrollRepository.find({ relations: ['employee'], order: { createdAt: 'DESC' } as any });
    }

    async findForUser(userId: string): Promise<Payroll[]> {
        const employee = await this.employeesRepository.findOne({ where: { userId } });
        if (!employee) {
            throw new NotFoundException('Employee record not found for this user.');
        }
        return this.payrollRepository.find({
            where: { employee: { id: employee.id } as any },
            relations: ['employee'],
            order: { createdAt: 'DESC' } as any,
        });
    }

    async findOne(id: string): Promise<Payroll> {
        const record = await this.payrollRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!record) {
            throw new NotFoundException(`Payroll record with ID ${id} not found`);
        }
        return record;
    }

    async createForEmployee(input: any): Promise<Payroll> {
        if (!input.employeeId) {
            throw new BadRequestException('employeeId is required');
        }

        const employee = await this.employeesRepository.findOne({ where: { id: input.employeeId } });
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${input.employeeId} not found`);
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

    async update(id: string, payrollData: Partial<Payroll>): Promise<Payroll> {
        const existing = await this.findOne(id);
        const employee = existing.employee as Employee | undefined;
        const patch: Partial<Payroll> = { ...payrollData };

        if (employee && (
            (payrollData as any).aiAutoCalculate ||
            payrollData.basicSalary !== undefined ||
            payrollData.allowances !== undefined ||
            payrollData.deductions !== undefined ||
            payrollData.netSalary !== undefined
        )) {
            const metrics = this.buildPayrollMetrics(
                {
                    basicSalary: payrollData.basicSalary ?? existing.basicSalary,
                    allowances: payrollData.allowances ?? existing.allowances,
                    deductions: payrollData.deductions ?? existing.deductions,
                    netSalary: payrollData.netSalary,
                    aiAutoCalculate: (payrollData as any).aiAutoCalculate,
                },
                employee,
            );

            patch.basicSalary = metrics.basicSalary as any;
            patch.allowances = metrics.allowances as any;
            patch.deductions = metrics.deductions as any;
            patch.netSalary = metrics.netSalary as any;
        }

        delete (patch as any).aiAutoCalculate;

        await this.payrollRepository.update(id, patch);
        const updated = await this.findOne(id);
        const updatedEmployee = updated.employee as any;
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

    async remove(id: string): Promise<void> {
        await this.payrollRepository.delete(id);
    }

    uploadPreview(file?: { buffer?: Buffer }) {
        if (!file?.buffer?.length) {
            throw new BadRequestException('Please upload an Excel file.');
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];

        if (!sheet) {
            throw new BadRequestException('The uploaded workbook does not contain a readable sheet.');
        }

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            defval: '',
            raw: false,
        });

        return rows
            .map((row, index) => this.mapImportRow(row, index))
            .filter((row) => row !== null);
    }

    async saveImportedPayroll(rows: any[]) {
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new BadRequestException('No payroll rows were provided for import.');
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
                    employee: { id: employee.id } as any,
                    month: normalized.month,
                    year: normalized.year,
                } as any,
                relations: ['employee'],
            });

            const metrics = this.buildPayrollMetrics(normalized, employee);

            if (existing) {
                existing.basicSalary = metrics.basicSalary as any;
                existing.allowances = metrics.allowances as any;
                existing.deductions = metrics.deductions as any;
                existing.netSalary = metrics.netSalary as any;
                existing.paymentStatus = normalized.paymentStatus;
                existing.paymentDate = normalized.paymentDate ? new Date(normalized.paymentDate) : null;
                await this.payrollRepository.save(existing);
            } else {
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

    private mapImportRow(row: Record<string, unknown>, index: number) {
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

    private normalizeImportedPayrollRow(input: any) {
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

    private buildPayrollMetrics(input: any, employee?: Employee | null) {
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

    private stringValue(value: unknown): string {
        return String(value ?? '').trim();
    }

    private numberValue(value: unknown): number {
        if (value === null || value === undefined || value === '') {
            return 0;
        }

        const parsed = Number(String(value).replace(/,/g, ''));
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private normalizeDateString(value: unknown): string | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const parsed = new Date(String(value));
        if (Number.isNaN(parsed.getTime())) {
            return null;
        }

        return parsed.toISOString().split('T')[0];
    }
}
