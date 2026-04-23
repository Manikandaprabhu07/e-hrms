import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { JobApplication } from './job-application.entity';

@Entity('job_openings')
export class JobOpening {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  department: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ default: 1 })
  openings: number;

  @Column({ default: 'Open' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => JobApplication, (application) => application.jobOpening)
  applications: JobApplication[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
