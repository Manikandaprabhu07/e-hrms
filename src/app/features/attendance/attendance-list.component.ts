import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  template: '<p>Attendance Management Component</p>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceListComponent {}
