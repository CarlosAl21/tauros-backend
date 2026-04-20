import { Module } from '@nestjs/common';
import { SugerenciaService } from './sugerencia.service';
import { SugerenciaController } from './sugerencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sugerencia } from './entities/sugerencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sugerencia])],
  controllers: [SugerenciaController],
  providers: [SugerenciaService],
})
export class SugerenciaModule {}
