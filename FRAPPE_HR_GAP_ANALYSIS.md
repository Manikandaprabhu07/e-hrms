# Frappe HR Gap Analysis

## Existing in this project

- Authentication and role-based access
- Employee management and employee profile views
- Attendance management
- Leave management
- Payroll management
- Performance management
- Training management
- Dashboard, events, notifications, feedback, and activity views

## Added in this update

- A new `HR Workspace` entry point to group HR capabilities in a Frappe-style structure
- Recruitment workspace with:
  - job openings
  - applicant pipeline
  - interview planning
- Employee lifecycle workspace with:
  - onboarding checklist
  - promotion, transfer, and confirmation tracking
  - separation tracker
- Shift management workspace with:
  - shift templates
  - shift assignments
  - shift requests
- Expense workspace with:
  - expense claims
  - salary advances and loans
  - payroll payout readiness cards
- Reports workspace with:
  - attendance, leave, payroll, hiring, onboarding, and expense report library
- Sidebar navigation links for the new HR workspace areas

## Still best as a next backend phase

- Database-backed recruitment entities and APIs
- Database-backed onboarding, separation, and shift workflow APIs
- Real expense claim persistence and payroll integration
- Full document workflow, asset return, and compliance records
- Advanced analytics and printable exports

## Notes

- The new Frappe-style modules are implemented as Angular workspaces backed by a shared client-side service.
- This keeps the UI and structure consistent with your current design while creating a clean path for future NestJS and PostgreSQL persistence.
