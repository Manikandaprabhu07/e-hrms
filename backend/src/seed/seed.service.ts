import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RolesService } from '../access/roles.service';
import { PermissionsService } from '../access/permissions.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
        private readonly permissionsService: PermissionsService,
    ) { }

    async onModuleInit() {
        await this.ensureDefaultPermissions();
        await this.ensureDefaultRoles();
        await this.ensureAdminUser();
    }

    private async ensureDefaultPermissions() {
        const defaults = [
            { name: 'employees.read', resource: 'employees', action: 'read', description: 'View employees' },
            { name: 'employees.write', resource: 'employees', action: 'write', description: 'Create/update employees' },
            { name: 'employees.delete', resource: 'employees', action: 'delete', description: 'Delete employees' },
            { name: 'leave.read', resource: 'leave', action: 'read', description: 'View leave requests' },
            { name: 'leave.write', resource: 'leave', action: 'write', description: 'Create leave requests' },
            { name: 'leave.approve', resource: 'leave', action: 'approve', description: 'Approve/reject leave' },
            { name: 'feedback.read', resource: 'feedback', action: 'read', description: 'View feedback' },
            { name: 'feedback.write', resource: 'feedback', action: 'write', description: 'Send feedback' },
            { name: 'roles.manage', resource: 'roles', action: 'manage', description: 'Manage roles' },
            { name: 'permissions.manage', resource: 'permissions', action: 'manage', description: 'Manage permissions' },
            { name: 'users.manage', resource: 'users', action: 'manage', description: 'Manage users' },
            { name: 'dashboard.read', resource: 'dashboard', action: 'read', description: 'View dashboards' },
        ];

        for (const perm of defaults) {
            const existing = await this.permissionsService.findByName(perm.name);
            if (!existing) {
                await this.permissionsService.create(perm);
            }
        }
    }

    private async ensureDefaultRoles() {
        const allPermissions = await this.permissionsService.findAll();
        const employeePermissions = allPermissions.filter((p) =>
            ['employees.read', 'leave.read', 'leave.write', 'feedback.write', 'dashboard.read'].includes(p.name)
        );

        const adminRole = await this.rolesService.findByName('ADMIN');
        if (!adminRole) {
            await this.rolesService.create({
                name: 'ADMIN',
                description: 'System administrator',
                permissions: allPermissions,
            } as any);
        }

        const employeeRole = await this.rolesService.findByName('EMPLOYEE');
        if (!employeeRole) {
            await this.rolesService.create({
                name: 'EMPLOYEE',
                description: 'Employee role',
                permissions: employeePermissions,
            } as any);
        }
    }

    private async ensureAdminUser() {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@hrms.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123';
        const existing = await this.usersService.findOneByEmail(adminEmail);
        if (existing) {
            return;
        }

        const adminRole = await this.rolesService.findByName('ADMIN');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await this.usersService.create({
            email: adminEmail,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            username: 'admin',
            roles: adminRole ? [adminRole] : [],
            isActive: true,
        });
    }
}
