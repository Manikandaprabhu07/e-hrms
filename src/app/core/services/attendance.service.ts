import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AttendanceRecord, AttendanceSummary, PaginationParams, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = '/api/attendance';

  private attendanceRecordsSignal = signal<AttendanceRecord[]>([]);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  attendanceRecords = this.attendanceRecordsSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  getAttendance(employeeId: string, params: PaginationParams): Promise<PaginatedResponse<AttendanceRecord>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const queryParams = new URLSearchParams();
    queryParams.set('employeeId', employeeId);
    queryParams.set('pageNumber', params.pageNumber.toString());
    queryParams.set('pageSize', params.pageSize.toString());

    return new Promise((resolve, reject) => {
      this.http.get<PaginatedResponse<AttendanceRecord>>(
        `${this.apiUrl}?${queryParams.toString()}`
      ).subscribe({
        next: (response) => {
          this.isLoadingSignal.set(false);
          resolve(response);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load attendance records');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  getAttendanceSummary(employeeId: string, startDate: Date, endDate: Date): Promise<AttendanceSummary> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new URLSearchParams({
      employeeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    return new Promise((resolve, reject) => {
      this.http.get<AttendanceSummary>(
        `${this.apiUrl}/summary?${params.toString()}`
      ).subscribe({
        next: (summary) => {
          this.isLoadingSignal.set(false);
          resolve(summary);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load attendance summary');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  markAttendance(record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.post<AttendanceRecord>(`${this.apiUrl}`, record).subscribe({
        next: (created) => {
          this.isLoadingSignal.set(false);
          resolve(created);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to mark attendance');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }
}
