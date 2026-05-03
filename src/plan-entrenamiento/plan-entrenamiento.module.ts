import { Module } from '@nestjs/common';
import { PlanEntrenamientoService } from './plan-entrenamiento.service';
import { PlanEntrenamientoController } from './plan-entrenamiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntrenamiento } from './entities/plan-entrenamiento.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { RutinaDia } from 'src/rutina-dia/entities/rutina-dia.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { CalentamientoEjercicio } from 'src/rutina-ejercicio/entities/calentamiento-ejercicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntrenamiento, Usuario, RutinaDia, RutinaEjercicio, CalentamientoEjercicio])],
  controllers: [PlanEntrenamientoController],
  providers: [PlanEntrenamientoService],
})
export class PlanEntrenamientoModule {}
