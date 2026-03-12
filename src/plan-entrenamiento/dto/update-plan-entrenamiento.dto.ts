import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanEntrenamientoDto } from './create-plan-entrenamiento.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlanEntrenamientoDto extends PartialType(CreatePlanEntrenamientoDto) {

    @IsString()
    @IsNotEmpty()
    planEntrenamientoId: string;
}
