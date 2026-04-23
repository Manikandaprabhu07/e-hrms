import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FrappeHrService } from '../../core/services';
import { WORKSPACE_STYLES } from './workspace.styles';

@Component({
  selector: 'app-reports-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-shell">
      <section class="hero">
        <span class="eyebrow">Reports</span>
        <h1>Operational and compliance reporting</h1>
        <p>
          Track attendance, leave, payroll, hiring, onboarding, and expenses through a unified
          report library built into your own HR platform.
        </p>
      </section>

      <section class="stats-grid">
        @for (stat of service.reportStats(); track stat.label) {
          <article class="stat-card">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </article>
        }
      </section>

      <section class="workspace-grid">
        @for (report of service.reports(); track report.id) {
          <article class="report-card">
            <div class="card-top">
              <div>
                <div class="item-title">{{ report.title }}</div>
                <div class="item-note">{{ report.description }}</div>
              </div>
              <span class="badge existing">{{ report.cadence }}</span>
            </div>

            <div class="metric">
              <div class="meta-label">Audience</div>
              <div class="item-subtitle">{{ report.audience }}</div>
            </div>

            <a class="report-link" [routerLink]="report.route">View workspace</a>
          </article>
        }
      </section>
    </div>
  `,
  styles: [WORKSPACE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsWorkspaceComponent {
  protected service = inject(FrappeHrService);

  constructor() {
    this.service.loadWorkspace();
  }
}
