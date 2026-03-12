import { Module } from '@nestjs/common';
import { RutinaDiaService } from './rutina-dia.service';
import { RutinaDiaController } from './rutina-dia.controller';

@Module({
  controllers: [RutinaDiaController],
  providers: [RutinaDiaService],
})
export class RutinaDiaModule {}
