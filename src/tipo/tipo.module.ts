import { Module } from '@nestjs/common';
import { TipoService } from './tipo.service';
import { TipoController } from './tipo.controller';

@Module({
  controllers: [TipoController],
  providers: [TipoService],
})
export class TipoModule {}
