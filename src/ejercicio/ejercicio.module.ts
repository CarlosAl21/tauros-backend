import { Module } from '@nestjs/common';
import { EjercicioService } from './ejercicio.service';
import { EjercicioController } from './ejercicio.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ejercicio } from './entities/ejercicio.entity';
import { Categoria } from 'src/categoria/entities/categoria.entity';
import { Tipo } from 'src/tipo/entities/tipo.entity';
import { Maquina } from 'src/maquina/entities/maquina.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ejercicio, Categoria, Tipo, Maquina]),
    CloudinaryModule,
  ],
  controllers: [EjercicioController],
  providers: [EjercicioService],
})
export class EjercicioModule {}
