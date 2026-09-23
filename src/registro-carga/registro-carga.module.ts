import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ejercicio } from 'src/ejercicio/entities/ejercicio.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { RegistroCarga } from './entities/registro-carga.entity';
import { RegistroCargaController } from './registro-carga.controller';
import { RegistroCargaService } from './registro-carga.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroCarga, Usuario, Ejercicio, RutinaEjercicio])],
  controllers: [RegistroCargaController],
  providers: [RegistroCargaService],
})
export class RegistroCargaModule {}
