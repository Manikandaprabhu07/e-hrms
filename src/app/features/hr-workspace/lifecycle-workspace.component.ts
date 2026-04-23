import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, FrappeHrService } from '../../core/services';
import { WORKSPACE_STYLES } from './workspace.styles';

@Component({
  selector: 'app-lifecycle-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-shell">
      <section class="hero">
        <span class="eyebrow">Employee lifecycle</span>
        <h1>Onboarding, transitions, and separation</h1>
        <p>
          Manage new joiners, internal moves, confirmations, and exits through structured
          checklists and owner-based progress.
        </p>
      </section>

      <section class="stats-grid">
        @for (stat of service.lifecycleStats(); track stat.label) {
          <article class="stat-card">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </article>
        }
      </section>

      <section class="section-grid">
        <article class="list-card">
          <div class="list-card-header">
            <div>
              <h2>Onboarding checklist</h2>
              <p class="item-note">Structured joining tasks for IT, admin, managers, and employees.</p>
            </div>
          </div>

          <div class="list">
            @for (task of service.onboardingTasks(); track task.id) {
              <div class="list-item">
                <div class="item-main">
                  <div class="item-title">{{ task.employee }}</div>
                  <div class="item-subtitle">{{ task.activity }}</div>
                  <div class="item-meta">
                    <span class="chip">{{ task.owner }}</span>
                    <span class="chip">Due {{ task.dueDate }}</span>
                  </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:10px;">
                  <span class="badge" [class.existing]="task.status === 'Completed'" [class.planned]="task.status === 'Pending'">
                    {{ task.status }}
                  </span>
                  @if (task.status === 'Pending' && isAdmin()) {
                    <button class="action-button secondary" (click)="service.completeOnboardingTask(task.id)">
                      Mark complete
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </article>

        <article class="list-card">
          <div class="list-card-header">
            <div>
              <h2>Employee transitions</h2>
              <p class="item-note">Promotion, transfer, and confirmation workflows.</p>
            </div>
          </div>

          <div class="list">
            @for (transition of service.transitions(); track transition.id) {
              <div class="list-item">
                <div class="item-main">
                  <div class="item-title">{{ transition.employee }}</div>
                  <div class="item-subtitle">{{ transition.changeType }} effective {{ transition.effectiveDate }}</div>
                  <div class="item-note">Owner: {{ transition.owner }}</div>
                </div>
                <span class="badge new">{{ transition.status }}</span>
              </div>
            }
          </div>
        </article>
      </section>

      <section class="list-card">
        <div class="list-card-header">
          <div>
            <h2>Separation tracker</h2>
            <p class="item-note">Exit interview, asset return, and closure monitoring.</p>
          </div>
        </div>

        <div class="list">
          @for (item of service.separationCases(); track item.id) {
            <div class="list-item">
              <div class="item-main">
                <div class="item-title">{{ item.employee }}</div>
                <div class="item-subtitle">{{ item.department }} | Relieving {{ item.relievingDate }}</div>
                <div class="item-note">Checklist progress: {{ item.checklistProgress }}</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:10px;">
                <span class="badge" [class.new]="item.status !== 'Closed'" [class.existing]="item.status === 'Closed'">
                  {{ item.status }}
                </span>
                @if (item.status !== 'Closed' && isAdmin()) {
                  <button class="action-button secondary" (click)="service.closeSeparation(item.id)">
                    Close case
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [WORKSPACE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifecycleWorkspaceComponent {
  private authService = inject(AuthService);
  protected service = inject(FrappeHrService);

  constructor() {
    this.service.loadWorkspace();
  }

  protected isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }
}
