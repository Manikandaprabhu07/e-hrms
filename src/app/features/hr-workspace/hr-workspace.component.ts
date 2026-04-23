import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, FrappeHrService } from '../../core/services';
import { WORKSPACE_STYLES } from './workspace.styles';

@Component({
  selector: 'app-hr-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-shell">
      <section class="hero">
        <span class="eyebrow">Unified operations</span>
        <h1>Workspace</h1>
        <p>
          Manage recruitment, employee lifecycle, shifts, expenses, and reporting from one place
          while staying fully connected to your employees, leave, attendance, payroll, performance,
          and training modules.
        </p>

        <div class="hero-actions">
          @for (action of heroActions(); track action.route) {
            <a [routerLink]="action.route" class="hero-link" [class.primary]="action.className === 'primary'" [class.secondary]="action.className === 'secondary'">
              {{ action.label }}
            </a>
          }
        </div>
      </section>

      <section class="stats-grid">
        @for (stat of service.overviewStats(); track stat.label) {
          <article class="stat-card">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </article>
        }
      </section>

      <section>
        <div class="card-top" style="margin-bottom: 16px;">
          <div>
            <h2>Workspace groups</h2>
            <p class="item-note">Each group brings together a major people operations workflow.</p>
          </div>
        </div>

        <div class="workspace-grid">
          @for (section of visibleSections(); track section.id) {
            <article class="workspace-card">
              <div class="card-top">
                <div>
                  <div class="item-title">{{ section.title }}</div>
                  <p class="item-note">{{ section.description }}</p>
                </div>
                <span class="badge" [class]="section.status">{{ section.status | titlecase }}</span>
              </div>

              <div class="metric">
                <div class="meta-label">{{ section.metricLabel }}</div>
                <div class="stat-value" style="font-size: 22px;">{{ section.metricValue }}</div>
              </div>

              <div class="capability-list">
                @for (capability of section.capabilities; track capability) {
                  <span class="chip">{{ capability }}</span>
                }
              </div>

              <a class="report-link" [routerLink]="section.route">Open workspace</a>
            </article>
          }
        </div>
      </section>

      <section class="list-card">
        <div class="list-card-header">
          <div>
            <h2>Coverage comparison</h2>
            <p class="item-note">
              A clear coverage map of the features now connected inside your HR platform.
            </p>
          </div>
        </div>

        <div class="table-wrap">
          <table class="coverage-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Feature</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              @for (item of service.coverage(); track item.category + item.feature) {
                <tr>
                  <td>{{ item.category }}</td>
                  <td>{{ item.feature }}</td>
                  <td>
                    <span class="badge" [class]="item.coverage">{{ item.coverage | titlecase }}</span>
                  </td>
                  <td>{{ item.notes }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [WORKSPACE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HrWorkspaceComponent {
  private authService = inject(AuthService);
  protected service = inject(FrappeHrService);

  protected visibleSections = computed(() =>
    this.service.sections().filter((section) => this.canAccessRoute(section.route)),
  );

  protected heroActions = computed(() => {
    const actions = [
      {
        label: 'Open recruitment desk',
        route: '/hr/recruitment',
        className: 'primary',
      },
      {
        label: 'Review lifecycle workflows',
        route: '/hr/lifecycle',
        className: 'secondary',
      },
      {
        label: 'Open shift management',
        route: '/hr/shifts',
        className: 'primary',
      },
      {
        label: 'Open expense claims',
        route: '/hr/expenses',
        className: 'secondary',
      },
    ];

    return actions.filter((action) => this.canAccessRoute(action.route)).slice(0, 2);
  });

  constructor() {
    this.service.loadWorkspace();
  }

  private canAccessRoute(route: string): boolean {
    if (route === '/hr/recruitment' || route === '/hr/lifecycle' || route === '/hr/reports') {
      return this.authService.hasRole('ADMIN');
    }

    if (route === '/hr/shifts' || route === '/hr/expenses') {
      return this.authService.hasRole('ADMIN') || this.authService.hasRole('EMPLOYEE');
    }

    return true;
  }
}
