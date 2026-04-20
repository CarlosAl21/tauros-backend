import { Module } from '@nestjs/common';
import { MaquinaService } from './maquina.service';
import { MaquinaController } from './maquina.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maquina } from './entities/maquina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Maquina]), CloudinaryModule],
  controllers: [MaquinaController],
  providers: [MaquinaService],
})
export class MaquinaModule {}
