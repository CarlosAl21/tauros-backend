import { Module } from '@nestjs/common';
import { ComposicionCorporalService } from './composicion-corporal.service';
import { ComposicionCorporalController } from './composicion-corporal.controller';

@Module({
  controllers: [ComposicionCorporalController],
  providers: [ComposicionCorporalService],
})
export class ComposicionCorporalModule {}
