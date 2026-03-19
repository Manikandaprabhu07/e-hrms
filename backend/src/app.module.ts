import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { LeaveModule } from './leave/leave.module';
import { TrainingModule } from './training/training.module';
import { PerformanceModule } from './performance/performance.module';
import { AccessModule } from './access/access.module';
import { FeedbackModule } from './feedback/feedback.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { ChatbarModule } from './chatbar/chatbar.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
      type: 'postgres',
      url: configService.get<string>('DATABASE_URL'),
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    inject: [ConfigService],
   }),
    EmployeesModule,
    UsersModule,
    AuthModule,
    AttendanceModule,
    PayrollModule,
    LeaveModule,
    TrainingModule,
    PerformanceModule,
    AccessModule,
    FeedbackModule,
    DashboardModule,
    EventsModule,
    NotificationsModule,
    MessagesModule,
    ChatbarModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    SeedService,
  ],
})
export class AppModule { }
