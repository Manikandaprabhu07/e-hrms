import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface JobOpeningDto {
  id: string;
  title: string;
  department: string;
  location?: string | null;
  openings: number;
  status: string;
  description?: string | null;
}

export interface JobApplicationDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  interviewer?: string | null;
  stage: string;
  score: number;
  resumeUrl?: string | null;
  jobOpening: JobOpeningDto;
}

@Injectable({
  providedIn: 'root',
})
export class RecruitmentService {
  private http = inject(HttpClient);
  private apiUrl = '/api/recruitment';

  getOpenings(): Promise<JobOpeningDto[]> {
    return new Promise((resolve, reject) => {
      this.http.get<JobOpeningDto[]>(`${this.apiUrl}/openings`).subscribe({
        next: resolve,
        error: reject,
      });
    });
  }

  createOpening(payload: Partial<JobOpeningDto>): Promise<JobOpeningDto> {
    return new Promise((resolve, reject) => {
      this.http.post<JobOpeningDto>(`${this.apiUrl}/openings`, payload).subscribe({
        next: resolve,
        error: reject,
      });
    });
  }

  getApplications(): Promise<JobApplicationDto[]> {
    return new Promise((resolve, reject) => {
      this.http.get<JobApplicationDto[]>(`${this.apiUrl}/applications`).subscribe({
        next: resolve,
        error: reject,
      });
    });
  }

  createApplication(payload: any): Promise<JobApplicationDto> {
    return new Promise((resolve, reject) => {
      this.http.post<JobApplicationDto>(`${this.apiUrl}/applications`, payload).subscribe({
        next: resolve,
        error: reject,
      });
    });
  }

  updateApplicationStage(id: string, payload: { stage: string; score?: number; interviewer?: string }): Promise<JobApplicationDto> {
    return new Promise((resolve, reject) => {
      this.http.patch<JobApplicationDto>(`${this.apiUrl}/applications/${id}/stage`, payload).subscribe({
        next: resolve,
        error: reject,
      });
    });
  }
}
