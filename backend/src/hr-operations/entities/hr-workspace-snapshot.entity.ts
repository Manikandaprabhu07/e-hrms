import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('hr_workspace_snapshots')
export class HrWorkspaceSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'E-HRMS' })
  brandName: string;

  @Column({ type: 'simple-json' })
  sections: any[];

  @Column({ type: 'simple-json' })
  coverage: any[];

  @Column({ type: 'simple-json' })
  jobOpenings: any[];

  @Column({ type: 'simple-json' })
  applicants: any[];

  @Column({ type: 'simple-json' })
  interviewPlans: any[];

  @Column({ type: 'simple-json' })
  onboardingTasks: any[];

  @Column({ type: 'simple-json' })
  transitions: any[];

  @Column({ type: 'simple-json' })
  separationCases: any[];

  @Column({ type: 'simple-json' })
  shiftTemplates: any[];

  @Column({ type: 'simple-json' })
  shiftAssignments: any[];

  @Column({ type: 'simple-json' })
  shiftRequests: any[];

  @Column({ type: 'simple-json' })
  expenseClaims: any[];

  @Column({ type: 'simple-json' })
  salaryStructures: any[];

  @Column({ type: 'simple-json' })
  loans: any[];

  @Column({ type: 'simple-json' })
  reports: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
