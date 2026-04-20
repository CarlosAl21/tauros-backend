import { Module } from '@nestjs/common';
import { TipoService } from './tipo.service';
import { TipoController } from './tipo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipo } from './entities/tipo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tipo])],
  controllers: [TipoController],
  providers: [TipoService],
})
export class TipoModule {}
