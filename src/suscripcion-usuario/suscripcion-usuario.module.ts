import { Module } from '@nestjs/common';
import { SuscripcionUsuarioService } from './suscripcion-usuario.service';
import { SuscripcionUsuarioController } from './suscripcion-usuario.controller';

@Module({
  controllers: [SuscripcionUsuarioController],
  providers: [SuscripcionUsuarioService],
})
export class SuscripcionUsuarioModule {}
