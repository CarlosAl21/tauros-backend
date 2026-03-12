import { PartialType } from '@nestjs/mapped-types';
import { CreateEventoDto } from './create-evento.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEventoDto extends PartialType(CreateEventoDto) {
    
    @IsString()
    @IsNotEmpty()
    eventpoId: string;
}
