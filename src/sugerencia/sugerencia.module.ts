import { Module } from '@nestjs/common';
import { SugerenciaService } from './sugerencia.service';
import { SugerenciaController } from './sugerencia.controller';

@Module({
  controllers: [SugerenciaController],
  providers: [SugerenciaService],
})
export class SugerenciaModule {}
