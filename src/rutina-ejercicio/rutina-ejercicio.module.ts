import { Module } from '@nestjs/common';
import { RutinaEjercicioService } from './rutina-ejercicio.service';
import { RutinaEjercicioController } from './rutina-ejercicio.controller';

@Module({
  controllers: [RutinaEjercicioController],
  providers: [RutinaEjercicioService],
})
export class RutinaEjercicioModule {}
