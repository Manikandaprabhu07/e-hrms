import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrOperationsController } from './hr-operations.controller';
import { HrOperationsService } from './hr-operations.service';
import { HrWorkspaceSnapshot } from './entities/hr-workspace-snapshot.entity';
import { Employee } from '../employees/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HrWorkspaceSnapshot, Employee])],
  controllers: [HrOperationsController],
  providers: [HrOperationsService],
  exports: [HrOperationsService],
})
export class HrOperationsModule {}
