import { Body, Controller, Delete, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { HrOperationsService } from './hr-operations.service';

@Controller('hr-operations')
export class HrOperationsController {
  constructor(private readonly hrOperationsService: HrOperationsService) {}

  @Get('workspace')
  @Roles('ADMIN', 'EMPLOYEE')
  getWorkspace() {
    return this.hrOperationsService.getWorkspace();
  }

  @Patch('applicants/:id/advance')
  @Roles('ADMIN')
  advanceApplicant(@Param('id') id: string) {
    return this.hrOperationsService.advanceApplicant(id);
  }

  @Patch('onboarding/:id/complete')
  @Roles('ADMIN')
  completeOnboardingTask(@Param('id') id: string) {
    return this.hrOperationsService.completeOnboardingTask(id);
  }

  @Patch('separation/:id/close')
  @Roles('ADMIN')
  closeSeparation(@Param('id') id: string) {
    return this.hrOperationsService.closeSeparation(id);
  }

  @Post('shift-requests')
  @Roles('EMPLOYEE')
  submitShiftRequest(
    @Request() req: any,
    @Body() body: { requestedShift?: string; dates?: string; shiftDate?: string; reason?: string },
  ) {
    return this.hrOperationsService.submitShiftRequestForUser(req.user.id, body);
  }

  @Patch('shift-requests/:id/status')
  @Roles('ADMIN')
  updateShiftRequestStatus(@Param('id') id: string, @Body() body: { status: 'Approved' | 'Rejected' }) {
    return this.hrOperationsService.updateShiftRequestStatus(id, body.status);
  }

  @Post('expenses')
  @Roles('EMPLOYEE')
  submitExpenseClaim(
    @Request() req: any,
    @Body()
    body: {
      category?: string;
      amount?: string;
      linkedTo?: string;
      reason?: string;
      paymentMode?: 'Cash' | 'Bank Transfer' | 'Payroll Reimbursement';
    },
  ) {
    return this.hrOperationsService.submitExpenseClaimForUser(req.user.id, body);
  }

  @Patch('expenses/:id/status')
  @Roles('ADMIN')
  updateExpenseStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.hrOperationsService.updateExpenseStatus(id, body.status);
  }

  // Interview Plans CRUD
  @Post('interview-plans')
  @Roles('ADMIN', 'HR')
  createInterviewPlan(@Body() body: { candidate: string; role?: string; round?: string; schedule?: string; panel?: string }) {
    return this.hrOperationsService.createInterviewPlan(body);
  }

  @Patch('interview-plans/:id')
  @Roles('ADMIN', 'HR')
  updateInterviewPlan(@Param('id') id: string, @Body() body: { candidate?: string; role?: string; round?: string; schedule?: string; panel?: string }) {
    return this.hrOperationsService.updateInterviewPlan(id, body);
  }

  @Delete('interview-plans/:id')
  @Roles('ADMIN', 'HR')
  deleteInterviewPlan(@Param('id') id: string) {
    return this.hrOperationsService.deleteInterviewPlan(id);
  }

  // Shift Templates CRUD
  @Post('shift-templates')
  @Roles('ADMIN', 'HR')
  createShiftTemplate(@Body() body: { name: string; timing?: string; team?: string; weeklyOff?: string }) {
    return this.hrOperationsService.createShiftTemplate(body);
  }

  @Patch('shift-templates/:id')
  @Roles('ADMIN', 'HR')
  updateShiftTemplate(@Param('id') id: string, @Body() body: { name?: string; timing?: string; team?: string; weeklyOff?: string }) {
    return this.hrOperationsService.updateShiftTemplate(id, body);
  }

  @Delete('shift-templates/:id')
  @Roles('ADMIN', 'HR')
  deleteShiftTemplate(@Param('id') id: string) {
    return this.hrOperationsService.deleteShiftTemplate(id);
  }

  // Transitions CRUD
  @Post('transitions')
  @Roles('ADMIN', 'HR')
  createTransition(@Body() body: { employeeId?: string; employee?: string; changeType?: string; effectiveDate?: string; owner?: string }) {
    return this.hrOperationsService.createTransition(body);
  }

  @Patch('transitions/:id')
  @Roles('ADMIN', 'HR')
  updateTransition(@Param('id') id: string, @Body() body: { changeType?: string; effectiveDate?: string; status?: string; owner?: string }) {
    return this.hrOperationsService.updateTransition(id, body);
  }

  @Delete('transitions/:id')
  @Roles('ADMIN', 'HR')
  deleteTransition(@Param('id') id: string) {
    return this.hrOperationsService.deleteTransition(id);
  }
}
