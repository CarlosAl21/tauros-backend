import { Module } from '@nestjs/common';
import { RutinaDiaService } from './rutina-dia.service';
import { RutinaDiaController } from './rutina-dia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutinaDia } from './entities/rutina-dia.entity';
import { PlanEntrenamiento } from 'src/plan-entrenamiento/entities/plan-entrenamiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RutinaDia, PlanEntrenamiento])],
  controllers: [RutinaDiaController],
  providers: [RutinaDiaService],
})
export class RutinaDiaModule {}
