import { Module } from '@nestjs/common';
import { SugerenciaService } from './sugerencia.service';
import { SugerenciaController } from './sugerencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sugerencia } from './entities/sugerencia.entity';
import { Evento } from 'src/evento/entities/evento.entity';
import { Ejercicio } from 'src/ejercicio/entities/ejercicio.entity';
import { RutinaDia } from 'src/rutina-dia/entities/rutina-dia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sugerencia, Evento, Ejercicio, RutinaDia])],
  controllers: [SugerenciaController],
  providers: [SugerenciaService],
})
export class SugerenciaModule {}
