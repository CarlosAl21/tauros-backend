import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
    
}
