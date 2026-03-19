import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../access/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        private usersService: UsersService,
        private rolesService: RolesService,
    ) { }

    findAll(): Promise<Employee[]> {
        return this.employeesRepository.find();
    }

    async findOne(id: string): Promise<Employee> {
        const employee = await this.employeesRepository.findOne({ where: { id } });
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }

    findByEmail(email: string): Promise<Employee | null> {
        return this.employeesRepository.findOne({ where: { email } });
    }

    findByUserId(userId: string): Promise<Employee | null> {
        return this.employeesRepository.findOne({ where: { userId } });
    }

    async create(employeeData: Partial<Employee> & { user?: { username?: string; password?: string; roleName?: string } }): Promise<Employee> {
        const userInput = (employeeData as any).user || {};
        const username = userInput.username || (employeeData as any).username;
        const password = userInput.password || (employeeData as any).password;
        const roleName = userInput.roleName || (employeeData as any).roleName || (employeeData as any).role || 'EMPLOYEE';

        let createdUserId: string | null = null;

        try {
            if (username) {
                if (!employeeData.email) {
                    throw new BadRequestException('Email is required to create a login account for the employee.');
                }
                if (!password) {
                    throw new BadRequestException('Password is required to create a login account for the employee.');
                }

                const desiredRole = await this.rolesService.findByName(String(roleName).toUpperCase());
                const fallbackRole = await this.rolesService.findByName('EMPLOYEE');
                const role = desiredRole || fallbackRole;
                const hashedPassword = await bcrypt.hash(String(password), 10);

                const user = await this.usersService.create({
                    email: employeeData.email,
                    username: String(username),
                    password: hashedPassword,
                    firstName: employeeData.firstName || 'Employee',
                    lastName: employeeData.lastName || '',
                    isActive: employeeData.isActive ?? true,
                    roles: role ? [role] : [],
                });

                createdUserId = user.id;
                employeeData.userId = user.id;
            }

            // Strip non-Employee properties that can appear in frontend payloads.
            const employeeEntityData: Partial<Employee> = { ...(employeeData as any) };
            delete (employeeEntityData as any).user;
            delete (employeeEntityData as any).username;
            delete (employeeEntityData as any).password;
            delete (employeeEntityData as any).roleName;
            delete (employeeEntityData as any).role;

            const employee = this.employeesRepository.create(employeeEntityData);
            return await this.employeesRepository.save(employee);
        } catch (error) {
            if (createdUserId) {
                await this.usersService.remove(createdUserId);
            }
            throw error;
        }
    }

    async update(id: string, employeeData: Partial<Employee>): Promise<Employee> {
        const existingEmployee = await this.findOne(id);

        const userInput = (employeeData as any).user || {};
        const username = userInput.username ?? (employeeData as any).username;
        const password = userInput.password ?? (employeeData as any).password;
        const roleName = userInput.roleName ?? (employeeData as any).roleName ?? (employeeData as any).role;

        // Strip non-Employee properties that can appear in frontend payloads.
        delete (employeeData as any).user;
        delete (employeeData as any).username;
        delete (employeeData as any).password;
        delete (employeeData as any).roleName;
        delete (employeeData as any).role;

        let createdUserId: string | null = null;

        try {
            if (username !== undefined || password !== undefined || roleName !== undefined) {
                const desiredRoleName = roleName ? String(roleName).toUpperCase() : undefined;
                const desiredRole = desiredRoleName
                    ? await this.rolesService.findByName(desiredRoleName)
                    : null;
                const fallbackRole = await this.rolesService.findByName('EMPLOYEE');
                const role = desiredRole || fallbackRole;

                const emailForUser = (employeeData as any).email ?? existingEmployee.email;
                if (!emailForUser) {
                    throw new BadRequestException('Email is required to create/update a login account for the employee.');
                }

                if (existingEmployee.userId) {
                    const patch: any = {};

                    if (username !== undefined) patch.username = username ? String(username) : null;
                    if ((employeeData as any).email !== undefined) patch.email = String(emailForUser);
                    if ((employeeData as any).firstName !== undefined) patch.firstName = String((employeeData as any).firstName);
                    if ((employeeData as any).lastName !== undefined) patch.lastName = String((employeeData as any).lastName);
                    if ((employeeData as any).isActive !== undefined) patch.isActive = Boolean((employeeData as any).isActive);

                    if (password) {
                        patch.password = await bcrypt.hash(String(password), 10);
                    }

                    // Only change roles when explicitly provided.
                    if (desiredRoleName && role) {
                        patch.roles = [role];
                    }

                    await this.usersService.update(existingEmployee.userId, patch);
                } else {
                    // Create a login account only if username + password are provided.
                    if (!username) {
                        throw new BadRequestException('Username is required to create a login account for the employee.');
                    }
                    if (!password) {
                        throw new BadRequestException('Password is required to create a login account for the employee.');
                    }

                    const hashedPassword = await bcrypt.hash(String(password), 10);
                    const user = await this.usersService.create({
                        email: String(emailForUser),
                        username: String(username),
                        password: hashedPassword,
                        firstName: (employeeData as any).firstName ?? existingEmployee.firstName ?? 'Employee',
                        lastName: (employeeData as any).lastName ?? existingEmployee.lastName ?? '',
                        isActive: (employeeData as any).isActive ?? existingEmployee.isActive ?? true,
                        roles: role ? [role] : [],
                    });

                    createdUserId = user.id;
                    (employeeData as any).userId = user.id;
                }
            }

            Object.assign(existingEmployee, employeeData);
            return await this.employeesRepository.save(existingEmployee);
        } catch (error) {
            if (createdUserId) {
                await this.usersService.remove(createdUserId);
            }
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        await this.employeesRepository.delete(id);
    }
}
