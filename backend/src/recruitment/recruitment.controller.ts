import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JobApplication } from './entities/job-application.entity';
import { JobOpening } from './entities/job-opening.entity';
import { JobRole } from './entities/job-role.entity';
import { RecruitmentService } from './recruitment.service';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get('openings')
  @Roles('ADMIN', 'HR', 'EMPLOYEE')
  findAllOpenings(): Promise<JobOpening[]> {
    return this.recruitmentService.findAllOpenings();
  }

  @Post('openings')
  @Roles('ADMIN', 'HR')
  createOpening(@Body() body: Partial<JobOpening>): Promise<JobOpening> {
    return this.recruitmentService.createOpening(body);
  }

  @Patch('openings/:id')
  @Roles('ADMIN', 'HR')
  updateOpening(@Param('id') id: string, @Body() body: Partial<JobOpening>): Promise<JobOpening> {
    return this.recruitmentService.updateOpening(id, body);
  }

  @Delete('openings/:id')
  @Roles('ADMIN', 'HR')
  removeOpening(@Param('id') id: string): Promise<void> {
    return this.recruitmentService.removeOpening(id);
  }

  @Get('applications')
  @Roles('ADMIN', 'HR')
  findAllApplications(): Promise<JobApplication[]> {
    return this.recruitmentService.findAllApplications();
  }

  @Post('applications')
  @Roles('ADMIN', 'HR')
  createApplication(@Body() body: any): Promise<JobApplication> {
    return this.recruitmentService.createApplication(body);
  }

  @Patch('applications/:id/stage')
  @Roles('ADMIN', 'HR')
  updateApplicationStage(@Param('id') id: string, @Body() body: { stage: string; score?: number; interviewer?: string }): Promise<JobApplication> {
    return this.recruitmentService.updateApplicationStage(id, body.stage, body.score, body.interviewer);
  }

  @Delete('applications/:id')
  @Roles('ADMIN', 'HR')
  removeApplication(@Param('id') id: string): Promise<void> {
    return this.recruitmentService.removeApplication(id);
  }

  // ============ JOB ROLES ============
  @Get('job-roles')
  @Roles('ADMIN', 'HR', 'EMPLOYEE')
  findAllJobRoles(): Promise<JobRole[]> {
    return this.recruitmentService.findAllJobRoles();
  }

  @Post('job-roles')
  @Roles('ADMIN', 'HR')
  createJobRole(@Body() body: Partial<JobRole>): Promise<JobRole> {
    return this.recruitmentService.createJobRole(body);
  }

  @Patch('job-roles/:id')
  @Roles('ADMIN', 'HR')
  updateJobRole(@Param('id') id: string, @Body() body: Partial<JobRole>): Promise<JobRole> {
    return this.recruitmentService.updateJobRole(id, body);
  }

  @Delete('job-roles/:id')
  @Roles('ADMIN', 'HR')
  removeJobRole(@Param('id') id: string): Promise<void> {
    return this.recruitmentService.removeJobRole(id);
  }
}
