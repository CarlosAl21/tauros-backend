import { Module } from '@nestjs/common';
import { RutinaEjercicioService } from './rutina-ejercicio.service';
import { RutinaEjercicioController } from './rutina-ejercicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutinaEjercicio } from './entities/rutina-ejercicio.entity';
import { CalentamientoEjercicio } from './entities/calentamiento-ejercicio.entity';
import { RutinaDia } from 'src/rutina-dia/entities/rutina-dia.entity';
import { Ejercicio } from 'src/ejercicio/entities/ejercicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RutinaEjercicio, CalentamientoEjercicio, RutinaDia, Ejercicio])],
  controllers: [RutinaEjercicioController],
  providers: [RutinaEjercicioService],
})
export class RutinaEjercicioModule {}
