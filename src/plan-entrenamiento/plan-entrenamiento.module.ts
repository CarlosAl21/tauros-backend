import { Module } from '@nestjs/common';
import { PlanEntrenamientoService } from './plan-entrenamiento.service';
import { PlanEntrenamientoController } from './plan-entrenamiento.controller';

@Module({
  controllers: [PlanEntrenamientoController],
  providers: [PlanEntrenamientoService],
})
export class PlanEntrenamientoModule {}
