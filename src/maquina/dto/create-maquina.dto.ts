import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMaquinaDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsOptional()
    @IsString()
    linkFoto?: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    numeroMaquina: number;
    
}
