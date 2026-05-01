import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanNutricionalDto } from './create-plan-nutricional.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlanNutricionalDto extends PartialType(CreatePlanNutricionalDto) {

    @IsString()
    @IsNotEmpty()
    planNutricionalId: string;
}
