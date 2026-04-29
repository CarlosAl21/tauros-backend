import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEjercicioDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsOptional()
    @IsString()
    linkVideo?: string;

    @IsOptional()
    @IsString()
    linkAM?: string;

    @IsString()
    @IsNotEmpty()
    categoriaId: string;

    @IsString()
    @IsNotEmpty()
    tipoId: string;

    @IsOptional()
    @IsString()
    maquinaId?: string | null;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
    
}
