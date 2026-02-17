import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoginResponse, User } from '../models';

@Injectable()
export class MockAuthInterceptor implements HttpInterceptor {
  private mockUsers: any = {
    'mani@hrms.com': {
      password: 'mani@1234',
      user: {
        id: '1',
        username: 'Admin',
        email: 'mani@hrms.com',
        firstName: 'Mani',
        lastName: 'Kandaprabhu',
        profileImage: 'https://ui-avatars.com/api/?name=Mani+Kandaprabhu',
        isOnline: true,
        roles: [{ id: '1', name: 'ADMIN', permissions: ['READ', 'WRITE', 'DELETE'] }],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      }
    },
    'EMP001': { // Kiruthik
      password: 'password',
      user: {
        id: 'EMP001',
        username: 'kiruthik',
        email: 'kiruthik.aswanth@company.com',
        firstName: 'Kiruthik',
        lastName: 'Aswanth',
        profileImage: 'https://ui-avatars.com/api/?name=Kiruthik+Aswanth&background=6366f1&color=fff',
        isOnline: true,
        roles: [{ id: '2', name: 'EMPLOYEE', permissions: ['READ'] }],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      }
    },
    'EMP002': { // Manikandaprabhu (Employee View)
      password: 'password',
      user: {
        id: 'EMP002',
        username: 'mani.user',
        email: 'mani@company.com',
        firstName: 'Manikanda',
        lastName: 'Prabhu',
        profileImage: 'https://ui-avatars.com/api/?name=Mani+Kandaprabhu&background=1e40af&color=fff',
        isOnline: true,
        roles: [{ id: '2', name: 'EMPLOYEE', permissions: ['READ'] }],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      }
    },
    'EMP003': {
      password: 'password',
      user: {
        id: 'EMP003',
        firstName: 'Uthaya',
        lastName: 'Kumar',
        email: 'uthaya@company.com',
        roles: [{ id: '2', name: 'EMPLOYEE', permissions: ['READ'] }]
      }
    },
    'EMP004': {
      password: 'password',
      user: { id: 'EMP004', firstName: 'Madesh', lastName: 'T', email: 'madesh@company.com', roles: [{ id: '2', name: 'EMPLOYEE', permissions: ['READ'] }] }
    },
    'EMP005': {
      password: 'password',
      user: { id: 'EMP005', firstName: 'Joshua', lastName: 'Davidson', email: 'joshua@company.com', roles: [{ id: '2', name: 'EMPLOYEE', permissions: ['READ'] }] }
    }
  };

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Mock login endpoint
    if (req.url.includes('/api/auth/login') && req.method === 'POST') {
      const { email, password } = req.body;

      // Try to find user by Key (Email or ID) OR by searching inside user objects for email
      let mockUser = this.mockUsers[email as keyof typeof this.mockUsers];

      // If not found by direct key look up, try searching values (for mixed ID/Email login scenarios)
      if (!mockUser) {
        const foundKey = Object.keys(this.mockUsers).find(key =>
          key === email ||
          this.mockUsers[key].user.email === email ||
          this.mockUsers[key].user.id === email
        );
        if (foundKey) {
          mockUser = this.mockUsers[foundKey];
        }
      }

      if (mockUser && mockUser.password === password) {
        const response: LoginResponse = {
          accessToken: this.generateMockToken(),
          user: mockUser.user,
          expiresIn: 3600
        };
        return of(new HttpResponse({ status: 200, body: response })).pipe(
          delay(800) // Simulate network delay
        );
      } else {
        return throwError(
          () =>
            new HttpResponse({
              status: 401,
              body: {
                message: 'Invalid ID/Email or password',
                code: 'INVALID_CREDENTIALS'
              }
            })
        ).pipe(delay(800));
      }
    }

    // Mock register endpoint
    if (req.url.includes('/api/auth/register') && req.method === 'POST') {
      const { email, firstName, lastName, password } = req.body;

      // Check if email already exists
      if (this.mockUsers[email as keyof typeof this.mockUsers]) {
        return throwError(
          () =>
            new HttpResponse({
              status: 409,
              body: {
                message: 'Email already registered',
                code: 'EMAIL_EXISTS'
              }
            })
        ).pipe(delay(800));
      }

      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: email.split('@')[0],
        email,
        firstName,
        lastName,
        profileImage: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
        isActive: true,
        roles: [{ id: '2', name: 'EMPLOYEE', permissions: ['READ'] }],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the new user to mockUsers so they can login
      this.mockUsers[email as keyof typeof this.mockUsers] = {
        password,
        user: newUser as any
      };

      const response: LoginResponse = {
        accessToken: this.generateMockToken(),
        user: newUser as any,
        expiresIn: 3600
      };
      return of(new HttpResponse({ status: 201, body: response })).pipe(
        delay(800)
      );
    }

    // Mock change password endpoint
    if (req.url.includes('/api/auth/change-password') && req.method === 'POST') {
      const { currentPassword, newPassword } = req.body;

      // Get current user email from any mockUser (in real app, get from JWT token)
      const currentUserEmail = Object.keys(this.mockUsers)[0];
      const currentUser = this.mockUsers[currentUserEmail as keyof typeof this.mockUsers];

      if (currentUser && currentUser.password === currentPassword) {
        // Update password
        currentUser.password = newPassword;
        return of(
          new HttpResponse({
            status: 200,
            body: { message: 'Password changed successfully' }
          })
        ).pipe(delay(800));
      } else {
        return throwError(
          () =>
            new HttpResponse({
              status: 401,
              body: {
                message: 'Current password is incorrect',
                code: 'INVALID_PASSWORD'
              }
            })
        ).pipe(delay(800));
      }
    }

    // Mock change email endpoint
    if (req.url.includes('/api/auth/change-email') && req.method === 'POST') {
      const { newEmail, password } = req.body;

      // Get current user email from any mockUser (in real app, get from JWT token)
      const currentUserEmail = Object.keys(this.mockUsers)[0];
      const currentUser = this.mockUsers[currentUserEmail as keyof typeof this.mockUsers];

      if (currentUser && currentUser.password === password) {
        // Update email
        if (this.mockUsers[newEmail as keyof typeof this.mockUsers]) {
          return throwError(
            () =>
              new HttpResponse({
                status: 409,
                body: {
                  message: 'Email already exists',
                  code: 'EMAIL_EXISTS'
                }
              })
          ).pipe(delay(800));
        }

        currentUser.user.email = newEmail;
        this.mockUsers[newEmail as keyof typeof this.mockUsers] = currentUser;
        delete (this.mockUsers as any)[currentUserEmail];

        return of(
          new HttpResponse({
            status: 200,
            body: {
              message: 'Email changed successfully',
              user: currentUser.user
            }
          })
        ).pipe(delay(800));
      } else {
        return throwError(
          () =>
            new HttpResponse({
              status: 401,
              body: {
                message: 'Password is incorrect',
                code: 'INVALID_PASSWORD'
              }
            })
        ).pipe(delay(800));
      }
    }

    // Mock employee endpoints
    if (req.url.includes('/api/employees')) {
      const mockEmployees = [
        {
          id: 'EMP001',
          employeeId: 'EMP001',
          firstName: 'Kiruthik',
          lastName: 'Aswanth',
          email: 'kiruthik.aswanth@company.com',
          designation: 'Senior Architect',
          department: 'Engineering',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Kiruthik+Aswanth&background=6366f1&color=fff',
          isActive: true,
          phone: '+91 98765 43220',
          dateOfJoining: '2020-03-15',
          salary: 125000,
          address: 'Chennai, Tamil Nadu, India'
        },
        {
          id: 'EMP002',
          employeeId: 'EMP002',
          firstName: 'Manikandaprabhu',
          lastName: 'User',
          email: 'mani@company.com',
          designation: 'Tech Lead',
          department: 'Engineering',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Mani+Kandaprabhu&background=1e40af&color=fff',
          isActive: true,
          phone: '+91 98765 43210',
          dateOfJoining: '2022-01-15',
          salary: 110000,
          address: 'Chennai, Tamil Nadu, India'
        },
        {
          id: 'EMP003',
          employeeId: 'EMP003',
          firstName: 'Uthaya',
          lastName: 'Kumar',
          email: 'uthaya@company.com',
          designation: 'Product Manager',
          department: 'Product',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'hybrid',
          avatar: 'https://ui-avatars.com/api/?name=Uthaya+Kumar&background=14b8a6&color=fff',
          isActive: true,
          phone: '+91 98765 43211',
          dateOfJoining: '2021-06-20',
          salary: 95000,
          address: 'Bangalore, Karnataka, India'
        },
        {
          id: 'EMP004',
          employeeId: 'EMP004',
          firstName: 'Madesh',
          lastName: 'T',
          email: 'madesh@company.com',
          designation: 'Senior UI/UX Designer',
          department: 'Design',
          employmentType: 'permanent',
          employmentStatus: 'on_leave',
          workLocation: 'remote',
          avatar: 'https://ui-avatars.com/api/?name=Madesh+Rajan&background=f59e0b&color=fff',
          isActive: true,
          phone: '+91 98765 43212',
          dateOfJoining: '2023-03-10',
          salary: 90000,
          address: 'Coimbatore, Tamil Nadu, India'
        },
        {
          id: 'EMP005',
          employeeId: 'EMP005',
          firstName: 'Joshua',
          lastName: 'Davidson',
          email: 'joshua@company.com',
          designation: 'Data Analyst',
          department: 'Analytics',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Joshua+David&background=ef4444&color=fff',
          isActive: true,
          phone: '+91 98765 43213',
          dateOfJoining: '2023-09-01',
          salary: 70000,
          address: 'Hyderabad, Telangana, India'
        },
        {
          id: 'EMP006',
          employeeId: 'EMP006',
          firstName: 'Sarah',
          lastName: 'Williams',
          email: 'sarah.w@company.com',
          designation: 'HR Manager',
          department: 'HR & Admin',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=ec4899&color=fff',
          isActive: true,
          phone: '+91 98765 43214',
          dateOfJoining: '2019-11-05',
          salary: 85000,
          address: 'Mumbai, Maharashtra, India'
        },
        {
          id: 'EMP007',
          employeeId: 'EMP007',
          firstName: 'David',
          lastName: 'Chen',
          email: 'david.chen@company.com',
          designation: 'Frontend Developer',
          department: 'Engineering',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'hybrid',
          avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=3b82f6&color=fff',
          isActive: true,
          phone: '+91 98765 43215',
          dateOfJoining: '2023-01-20',
          salary: 65000,
          address: 'Pune, Maharashtra, India',
          dateOfBirth: '1995-05-15',
          gender: 'male',
          nationality: 'Indian'
        },
        {
          id: 'EMP008',
          employeeId: 'EMP008',
          firstName: 'Emily',
          lastName: 'Rodriguez',
          email: 'emily.r@company.com',
          designation: 'Marketing Specialist',
          department: 'Marketing',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=8b5cf6&color=fff',
          isActive: true,
          phone: '+91 98765 43216',
          dateOfJoining: '2022-08-15',
          salary: 60000,
          address: 'Delhi, India'
        },
        {
          id: 'EMP009',
          employeeId: 'EMP009',
          firstName: 'James',
          lastName: 'Smith',
          email: 'james.smith@company.com',
          designation: 'DevOps Engineer',
          department: 'Engineering',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=James+Smith&background=10b981&color=fff',
          isActive: true,
          phone: '+91 98765 43217',
          dateOfJoining: '2022-05-10',
          salary: 80000,
          address: 'Noida, UP, India'
        },
        {
          id: 'EMP010',
          employeeId: 'EMP010',
          firstName: 'Priya',
          lastName: 'Sharma',
          email: 'priya.s@company.com',
          designation: 'QA Engineer',
          department: 'Engineering',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=f43f5e&color=fff',
          isActive: true,
          phone: '+91 98765 43218',
          dateOfJoining: '2023-06-01',
          salary: 55000,
          address: 'Gurgaon, Haryana, India'
        },
        {
          id: 'EMP011',
          employeeId: 'EMP011',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.b@company.com',
          designation: 'Sales Executive',
          department: 'Sales',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=f97316&color=fff',
          isActive: true,
          phone: '+91 98765 43219',
          dateOfJoining: '2023-02-28',
          salary: 50000,
          address: 'Kolkata, West Bengal, India'
        },
        {
          id: 'EMP012',
          employeeId: 'EMP012',
          firstName: 'Anita',
          lastName: 'Desai',
          email: 'anita.d@company.com',
          designation: 'Content Writer',
          department: 'Marketing',
          employmentType: 'contract',
          employmentStatus: 'active',
          workLocation: 'remote',
          avatar: 'https://ui-avatars.com/api/?name=Anita+Desai&background=06b6d4&color=fff',
          isActive: true,
          phone: '+91 98765 43221',
          dateOfJoining: '2023-10-10',
          salary: 45000,
          address: 'Mumbai, Maharashtra, India'
        },
        {
          id: 'EMP013',
          employeeId: 'EMP013',
          firstName: 'Robert',
          lastName: 'Taylor',
          email: 'robert.t@company.com',
          designation: 'System Administrator',
          department: 'IT Support',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Robert+Taylor&background=64748b&color=fff',
          isActive: true,
          phone: '+91 98765 43222',
          dateOfJoining: '2021-01-15',
          salary: 70000,
          address: 'Bangalore, Karnataka, India'
        },
        {
          id: 'EMP014',
          employeeId: 'EMP014',
          firstName: 'Lakshmi',
          lastName: 'Narayanan',
          email: 'lakshmi.n@company.com',
          designation: 'Finance Manager',
          department: 'Finance',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Lakshmi+Narayanan&background=84cc16&color=fff',
          isActive: true,
          phone: '+91 98765 43223',
          dateOfJoining: '2020-08-01',
          salary: 90000,
          address: 'Chennai, Tamil Nadu, India'
        },
        {
          id: 'EMP015',
          employeeId: 'EMP015',
          firstName: 'Kevin',
          lastName: 'White',
          email: 'kevin.w@company.com',
          designation: 'Junior Developer',
          department: 'Engineering',
          employmentType: 'probation',
          employmentStatus: 'probation',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Kevin+White&background=a855f7&color=fff',
          isActive: true,
          phone: '+91 98765 43224',
          dateOfJoining: '2023-12-01',
          salary: 40000,
          address: 'Hyderabad, Telangana, India'
        },
        {
          id: 'EMP016',
          employeeId: 'EMP016',
          firstName: 'Sanya',
          lastName: 'Mirza',
          email: 'sanya.m@company.com',
          designation: 'Recruiter',
          department: 'HR & Admin',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Sanya+Mirza&background=db2777&color=fff',
          isActive: true,
          phone: '+91 98765 43225',
          dateOfJoining: '2022-04-15',
          salary: 55000,
          address: 'Delhi, India'
        },
        {
          id: 'EMP017',
          employeeId: 'EMP017',
          firstName: 'Rahul',
          lastName: 'Verma',
          email: 'rahul.v@company.com',
          designation: 'Business Analyst',
          department: 'Product',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'hybrid',
          avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=ea580c&color=fff',
          isActive: true,
          phone: '+91 98765 43226',
          dateOfJoining: '2021-11-20',
          salary: 85000,
          address: 'Pune, Maharashtra, India'
        },
        {
          id: 'EMP018',
          employeeId: 'EMP018',
          firstName: 'Jessica',
          lastName: 'Lee',
          email: 'jessica.l@company.com',
          designation: 'Graphic Designer',
          department: 'Design',
          employmentType: 'contract',
          employmentStatus: 'active',
          workLocation: 'remote',
          avatar: 'https://ui-avatars.com/api/?name=Jessica+Lee&background=0ea5e9&color=fff',
          isActive: true,
          phone: '+91 98765 43227',
          dateOfJoining: '2023-07-01',
          salary: 45000,
          address: 'Bangalore, Karnataka, India'
        },
        {
          id: 'EMP019',
          employeeId: 'EMP019',
          firstName: 'Arun',
          lastName: 'Prakash',
          email: 'arun.p@company.com',
          designation: 'Backend Developer',
          department: 'Engineering',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Arun+Prakash&background=4f46e5&color=fff',
          isActive: true,
          phone: '+91 98765 43228',
          dateOfJoining: '2022-09-10',
          salary: 75000,
          address: 'Kochi, Kerala, India'
        },
        {
          id: 'EMP020',
          employeeId: 'EMP020',
          firstName: 'Meera',
          lastName: 'Iyer',
          email: 'meera.i@company.com',
          designation: 'Customer Support Lead',
          department: 'Support',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Meera+Iyer&background=be123c&color=fff',
          isActive: true,
          phone: '+91 98765 43229',
          dateOfJoining: '2020-05-15',
          salary: 65000,
          address: 'Chennai, Tamil Nadu, India'
        },
        {
          id: 'EMP021',
          employeeId: 'EMP021',
          firstName: 'Vikram',
          lastName: 'Singh',
          email: 'vikram.s@company.com',
          designation: 'Sales Manager',
          department: 'Sales',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=b45309&color=fff',
          isActive: true,
          phone: '+91 98765 43230',
          dateOfJoining: '2019-08-01',
          salary: 100000,
          address: 'Delhi, India'
        },
        {
          id: 'EMP022',
          employeeId: 'EMP022',
          firstName: 'Nina',
          lastName: 'Patel',
          email: 'nina.p@company.com',
          designation: 'Legal Advisor',
          department: 'Legal',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'remote',
          avatar: 'https://ui-avatars.com/api/?name=Nina+Patel&background=4c1d95&color=fff',
          isActive: true,
          phone: '+91 98765 43231',
          dateOfJoining: '2021-03-01',
          salary: 120000,
          address: 'Mumbai, Maharashtra, India'
        },
        {
          id: 'EMP023',
          employeeId: 'EMP023',
          firstName: 'Suresh',
          lastName: 'Raina',
          email: 'suresh.r@company.com',
          designation: 'Operations Manager',
          department: 'Operations',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Suresh+Raina&background=047857&color=fff',
          isActive: true,
          phone: '+91 98765 43232',
          dateOfJoining: '2020-01-20',
          salary: 95000,
          address: 'Chennai, Tamil Nadu, India'
        },
        {
          id: 'EMP024',
          employeeId: 'EMP024',
          firstName: 'Karthik',
          lastName: 'Subbaraj',
          email: 'karthik.s@company.com',
          designation: 'Video Editor',
          department: 'Marketing',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Karthik+Subbaraj&background=b91c1c&color=fff',
          isActive: true,
          phone: '+91 98765 43233',
          dateOfJoining: '2022-06-15',
          salary: 50000,
          address: 'Chennai, Tamil Nadu, India'
        },
        {
          id: 'EMP025',
          employeeId: 'EMP025',
          firstName: 'Zara',
          lastName: 'Khan',
          email: 'zara.k@company.com',
          designation: 'Social Media Manager',
          department: 'Marketing',
          employmentType: 'permanent',
          employmentStatus: 'active',
          workLocation: 'office',
          avatar: 'https://ui-avatars.com/api/?name=Zara+Khan&background=be185d&color=fff',
          isActive: true,
          phone: '+91 98765 43234',
          dateOfJoining: '2023-04-10',
          salary: 55000,
          address: 'Mumbai, Maharashtra, India'
        },
      ];

      // GET /api/employees/:id
      const idMatch = req.url.match(/\/api\/employees\/([^\/\?]+)/);
      if (idMatch && req.method === 'GET') {
        const id = idMatch[1];
        const employee = mockEmployees.find(e => e.id === id || e.employeeId === id);

        if (employee) {
          return of(new HttpResponse({ status: 200, body: employee })).pipe(delay(500));
        } else {
          return throwError(() => new HttpResponse({ status: 404, body: { message: 'Employee not found' } })).pipe(delay(500));
        }
      }

      // PUT /api/employees/:id
      if (idMatch && req.method === 'PUT') {
        return of(new HttpResponse({ status: 200, body: { ...req.body, id: idMatch[1] } })).pipe(delay(800));
      }

      // GET /api/employees (List)
      if (req.method === 'GET') {
        return of(
          new HttpResponse({
            status: 200,
            body: {
              data: mockEmployees,
              items: mockEmployees,
              pageNumber: 1,
              pageSize: 25,
              totalCount: 25,
              totalPages: 1
            }
          })
        ).pipe(delay(500));
      }
    }

    // Pass through other requests
    return next.handle(req);
  }

  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: '1',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      })
    );
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }
}
