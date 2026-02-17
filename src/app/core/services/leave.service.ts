import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaveRequest, LeaveBalance, PaginationParams, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private http = inject(HttpClient);
  private apiUrl = '/api/leave';

  private leaveRequestsSignal = signal<LeaveRequest[]>([]);
  private leaveBalancesSignal = signal<LeaveBalance[]>([]);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  leaveRequests = this.leaveRequestsSignal.asReadonly();
  leaveBalances = this.leaveBalancesSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  getLeaveRequests(employeeId: string, params: PaginationParams): Promise<PaginatedResponse<LeaveRequest>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const queryParams = new URLSearchParams();
    queryParams.set('employeeId', employeeId);
    queryParams.set('pageNumber', params.pageNumber.toString());
    queryParams.set('pageSize', params.pageSize.toString());

    return new Promise((resolve, reject) => {
      this.http.get<PaginatedResponse<LeaveRequest>>(
        `${this.apiUrl}/requests?${queryParams.toString()}`
      ).subscribe({
        next: (response) => {
          this.isLoadingSignal.set(false);
          resolve(response);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load leave requests');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  getLeaveBalance(employeeId: string, year: number): Promise<LeaveBalance[]> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new URLSearchParams({
      employeeId,
      year: year.toString()
    });

    return new Promise((resolve, reject) => {
      this.http.get<LeaveBalance[]>(
        `${this.apiUrl}/balances?${params.toString()}`
      ).subscribe({
        next: (balances) => {
          this.isLoadingSignal.set(false);
          this.leaveBalancesSignal.set(balances);
          resolve(balances);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load leave balance');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  requestLeave(request: Partial<LeaveRequest>): Promise<LeaveRequest> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.post<LeaveRequest>(`${this.apiUrl}/requests`, request).subscribe({
        next: (created) => {
          this.isLoadingSignal.set(false);
          this.leaveRequestsSignal.update(requests => [...requests, created]);
          resolve(created);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to request leave');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  approveLeaveRequest(leaveRequestId: string, remarks?: string): Promise<LeaveRequest> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.put<LeaveRequest>(
        `${this.apiUrl}/requests/${leaveRequestId}/approve`,
        { remarks }
      ).subscribe({
        next: (updated) => {
          this.isLoadingSignal.set(false);
          resolve(updated);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to approve leave request');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  rejectLeaveRequest(leaveRequestId: string, reason: string): Promise<LeaveRequest> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.put<LeaveRequest>(
        `${this.apiUrl}/requests/${leaveRequestId}/reject`,
        { reason }
      ).subscribe({
        next: (updated) => {
          this.isLoadingSignal.set(false);
          resolve(updated);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to reject leave request');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }
}
