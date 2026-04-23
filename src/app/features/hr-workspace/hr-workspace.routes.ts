import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards';

export const HR_WORKSPACE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./hr-workspace.component').then((m) => m.HrWorkspaceComponent),
  },
  {
    path: 'recruitment',
    loadComponent: () =>
      import('./recruitment-workspace.component').then((m) => m.RecruitmentWorkspaceComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'lifecycle',
    loadComponent: () =>
      import('./lifecycle-workspace.component').then((m) => m.LifecycleWorkspaceComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'shifts',
    loadComponent: () =>
      import('./shifts-workspace.component').then((m) => m.ShiftsWorkspaceComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'EMPLOYEE'] },
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./expenses-workspace.component').then((m) => m.ExpensesWorkspaceComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'EMPLOYEE'] },
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./reports-workspace.component').then((m) => m.ReportsWorkspaceComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] },
  },
];
