import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { JobOpening } from './job-opening.entity';

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => JobOpening, (jobOpening) => jobOpening.applications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  jobOpening: JobOpening;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  source?: string;

  @Column({ nullable: true })
  interviewer?: string;

  @Column({ default: 'Applied' })
  stage: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'text', nullable: true })
  resumeUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
