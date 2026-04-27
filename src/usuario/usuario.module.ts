import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from './entities/usuario.entity';
import { PlanEntrenamiento } from 'src/plan-entrenamiento/entities/plan-entrenamiento.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { Ejercicio } from 'src/ejercicio/entities/ejercicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, PlanEntrenamiento, RutinaEjercicio, Ejercicio])],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [TypeOrmModule, UsuarioService],
})
export class UsuarioModule {}
