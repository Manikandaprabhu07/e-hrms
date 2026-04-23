import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOpening } from './entities/job-opening.entity';
import { JobApplication } from './entities/job-application.entity';
import { JobRole } from './entities/job-role.entity';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(JobOpening)
    private readonly openingsRepository: Repository<JobOpening>,
    @InjectRepository(JobApplication)
    private readonly applicationsRepository: Repository<JobApplication>,
    @InjectRepository(JobRole)
    private readonly jobRolesRepository: Repository<JobRole>,
  ) {}

  findAllOpenings(): Promise<JobOpening[]> {
    return this.openingsRepository.find({
      relations: ['applications'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOpening(id: string): Promise<JobOpening> {
    const opening = await this.openingsRepository.findOne({
      where: { id },
      relations: ['applications'],
    });
    if (!opening) {
      throw new NotFoundException(`Job opening with ID ${id} not found`);
    }
    return opening;
  }

  createOpening(data: Partial<JobOpening>): Promise<JobOpening> {
    const opening = this.openingsRepository.create({
      title: data.title,
      department: data.department,
      location: data.location || undefined,
      openings: data.openings ?? 1,
      status: data.status || 'Open',
      description: data.description || null,
    });
    return this.openingsRepository.save(opening);
  }

  async updateOpening(id: string, data: Partial<JobOpening>): Promise<JobOpening> {
    const opening = await this.findOpening(id);
    Object.assign(opening, data);
    await this.openingsRepository.save(opening);
    return this.findOpening(id);
  }

  async removeOpening(id: string): Promise<void> {
    await this.openingsRepository.delete(id);
  }

  findAllApplications(): Promise<JobApplication[]> {
    return this.applicationsRepository.find({
      relations: ['jobOpening'],
      order: { createdAt: 'DESC' },
    });
  }

  async findApplication(id: string): Promise<JobApplication> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['jobOpening'],
    });
    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    return application;
  }

  async createApplication(data: {
    jobOpeningId: string;
    fullName: string;
    email: string;
    phone?: string;
    source?: string;
    interviewer?: string;
    stage?: string;
    score?: number;
    resumeUrl?: string;
  }): Promise<JobApplication> {
    const opening = await this.findOpening(data.jobOpeningId);
    const application = this.applicationsRepository.create({
      jobOpening: opening as any,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || undefined,
      source: data.source || undefined,
      interviewer: data.interviewer || undefined,
      stage: data.stage || 'Applied',
      score: data.score ?? 0,
      resumeUrl: data.resumeUrl || undefined,
    });

    return this.applicationsRepository.save(application);
  }

  async updateApplicationStage(id: string, stage: string, score?: number, interviewer?: string): Promise<JobApplication> {
    const application = await this.findApplication(id);
    application.stage = stage;
    if (score !== undefined) {
      application.score = Number(score);
    }
    if (interviewer !== undefined) {
      application.interviewer = interviewer;
    }
    await this.applicationsRepository.save(application);
    return this.findApplication(id);
  }

  async removeApplication(id: string): Promise<void> {
    await this.applicationsRepository.delete(id);
  }

  // ============ JOB ROLES CRUD ============
  findAllJobRoles(): Promise<JobRole[]> {
    return this.jobRolesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findJobRole(id: string): Promise<JobRole> {
    const role = await this.jobRolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Job role with ID ${id} not found`);
    }
    return role;
  }

  createJobRole(data: Partial<JobRole>): Promise<JobRole> {
    const role = this.jobRolesRepository.create({
      name: data.name,
      description: data.description || null,
      department: data.department || null,
      isActive: data.isActive ?? true,
    });
    return this.jobRolesRepository.save(role);
  }

  async updateJobRole(id: string, data: Partial<JobRole>): Promise<JobRole> {
    const role = await this.findJobRole(id);
    Object.assign(role, data);
    await this.jobRolesRepository.save(role);
    return this.findJobRole(id);
  }

  async removeJobRole(id: string): Promise<void> {
    await this.jobRolesRepository.delete(id);
  }
}
