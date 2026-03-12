import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoService } from './evento.service';
import { EventoController } from './evento.controller';
import { Evento } from './entities/evento.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, Usuario])],
  controllers: [EventoController],
  providers: [EventoService],
})
export class EventoModule {}
