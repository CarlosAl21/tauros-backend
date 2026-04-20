import { Module } from '@nestjs/common';
import { ComposicionCorporalService } from './composicion-corporal.service';
import { ComposicionCorporalController } from './composicion-corporal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComposicionCorporal } from './entities/composicion-corporal.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComposicionCorporal, Usuario])],
  controllers: [ComposicionCorporalController],
  providers: [ComposicionCorporalService],
})
export class ComposicionCorporalModule {}
