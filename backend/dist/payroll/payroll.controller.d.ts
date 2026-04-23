import { PayrollService } from './payroll.service';
import { Payroll } from './entities/payroll.entity';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    findAll(): Promise<Payroll[]>;
    my(req: any): Promise<Payroll[]>;
    findOne(id: string): Promise<Payroll>;
    create(payrollData: any): Promise<Payroll>;
    uploadPreview(file: any): {
        employeeId: string;
        month: string;
        year: number;
        basicSalary: number;
        allowances: number;
        deductions: number;
        netSalary: number;
        paymentStatus: string;
        paymentDate: string | null;
        aiInsight: string;
    }[];
    saveImportedPayroll(rows: any[]): Promise<{
        message: string;
        saved: number;
        skipped: number;
    }>;
    update(id: string, payrollData: Partial<Payroll>): Promise<Payroll>;
    remove(id: string): Promise<void>;
}
