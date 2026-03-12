import { OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RolesService } from '../access/roles.service';
import { PermissionsService } from '../access/permissions.service';
export declare class SeedService implements OnModuleInit {
    private readonly usersService;
    private readonly rolesService;
    private readonly permissionsService;
    constructor(usersService: UsersService, rolesService: RolesService, permissionsService: PermissionsService);
    onModuleInit(): Promise<void>;
    private ensureDefaultPermissions;
    private ensureDefaultRoles;
    private ensureAdminUser;
}
