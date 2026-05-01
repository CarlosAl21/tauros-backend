import { Module } from '@nestjs/common';
import { PlanNutricionalService } from './plan-nutricional.service';
import { PlanNutricionalController } from './plan-nutricional.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanNutricional } from './entities/plan-nutricional.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanNutricional, Usuario]),
    CloudinaryModule,
  ],
  controllers: [PlanNutricionalController],
  providers: [PlanNutricionalService],
})
export class PlanNutricionalModule {}
