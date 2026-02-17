import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingService } from '../../core/services';
import { LoadingSpinnerComponent, CardComponent } from '../../shared/components';

@Component({
    selector: 'app-training-list',
    standalone: true,
    imports: [CommonModule, LoadingSpinnerComponent, CardComponent],
    template: `
    <div class="training-container">
      <div class="page-header">
        <h1>Training & Development</h1>
        <p class="subtitle">Manage employee training programs and workshops</p>
      </div>

      <app-card [elevated]="true">
        <app-loading-spinner [isLoading]="isLoading()" message="Loading training sessions..." />
        
        @if (!isLoading() && sessions().length > 0) {
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Training Title</th>
                  <th>Trainer</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Participants</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (session of sessions(); track session.id) {
                  <tr>
                    <td>
                      <div class="session-info">
                        <span class="session-title">{{ session.title }}</span>
                        <span class="session-desc">{{ session.description || 'No description' }}</span>
                      </div>
                    </td>
                    <td>{{ session.trainer }}</td>
                    <td>{{ session.date | date:'mediumDate' }}</td>
                    <td>{{ session.duration }}</td>
                    <td>
                      <div class="participants-progress">
                        <div class="progress-info">
                          <span>{{ session.enrolledCount }}/{{ session.maxParticipants }}</span>
                        </div>
                        <div class="progress-bar">
                          <div class="progress-fill" [style.width.%]="(session.enrolledCount / session.maxParticipants) * 100"></div>
                        </div>
                      </div>
                    </td>
                    <td>{{ session.location || 'Online' }}</td>
                    <td>
                      <span class="status-badge" [ngClass]="getStatusClass(session.status)">
                        {{ session.status }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-primary" (click)="viewDetails(session)">Details</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (!isLoading()) {
          <p class="text-center text-muted">No training sessions found</p>
        }
      </app-card>
    </div>
  `,
    styles: [`
    .training-container {
      padding: 0;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }

    .subtitle {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: #64748b;
    }

    .table-responsive {
      width: 100%;
      height: calc(100vh - 180px); /* Fixed height */
      overflow-y: auto;
      overflow-x: auto;
      display: block;
      -webkit-overflow-scrolling: touch;
      border: 1px solid #e2e8f0;
    }

    table {
      border-collapse: collapse;
      min-width: 1400px;
      width: 100%;
      background: white;
      border: none;
      table-layout: fixed;
    }
    
    /* Column Widths */
    th:nth-child(1), td:nth-child(1) { width: 250px; } /* Title */
    th:nth-child(2), td:nth-child(2) { width: 200px; } /* Trainer */
    th:nth-child(3), td:nth-child(3) { width: 130px; } /* Date */
    th:nth-child(4), td:nth-child(4) { width: 120px; } /* Duration */
    th:nth-child(5), td:nth-child(5) { width: 180px; } /* Participants */
    th:nth-child(6), td:nth-child(6) { width: 150px; } /* Location */
    th:nth-child(7), td:nth-child(7) { width: 120px; } /* Status */
    th:nth-child(8), td:nth-child(8) { width: 120px; } /* Actions */

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    th {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: #f8fafc;
      font-weight: 600;
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #cbd5e1;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    tr:hover td {
      background-color: #f9fafb;
    }

    .session-info {
      display: flex;
      flex-direction: column;
      max-width: 250px;
    }

    .session-title {
      font-weight: 600;
      color: #1e293b;
      white-space: normal;
    }

    .session-desc {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .participants-progress {
      width: 120px;
    }

    .progress-info {
      font-size: 12px;
      margin-bottom: 4px;
      color: #64748b;
      text-align: right;
    }

    .progress-bar {
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #3b82f6;
      border-radius: 3px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.upcoming {
      background: #eff6ff;
      color: #2563eb;
    }

    .status-badge.completed {
      background: #f1f5f9;
      color: #475569;
    }

    .status-badge.inprogress {
      background: #fff7ed;
      color: #ea580c;
    }

    .status-badge.cancelled {
      background: #fef2f2;
      color: #dc2626;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #1e40af;
      color: white;
    }

    .btn-primary:hover {
      background: #1e3a8a;
    }

    .text-center {
      text-align: center;
      padding: 40px;
    }

    .text-muted {
      color: #64748b;
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingListComponent {
    private trainingService = inject(TrainingService);

    sessions = this.trainingService.sessions;
    isLoading = this.trainingService.isLoading;

    getStatusClass(status: string): string {
        return status.toLowerCase().replace(' ', '');
    }

    viewDetails(session: any): void {
        alert(`Showing details for training: \${session.title}\\nTrainer: \${session.trainer}\\nLocation: \${session.location || 'Online'}`);
    }
}
