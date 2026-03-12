import { PartialType } from '@nestjs/mapped-types';
import { CreateComposicionCorporalDto } from './create-composicion-corporal.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateComposicionCorporalDto extends PartialType(CreateComposicionCorporalDto) {

    @IsString()
    @IsNotEmpty()
    composicionCorporalId: string;
}
