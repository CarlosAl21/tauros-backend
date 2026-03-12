import { Module } from '@nestjs/common';
import { MaquinaService } from './maquina.service';
import { MaquinaController } from './maquina.controller';

@Module({
  controllers: [MaquinaController],
  providers: [MaquinaService],
})
export class MaquinaModule {}
