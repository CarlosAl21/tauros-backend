import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateEjercicioDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    linkVideo: string;

    @IsString()
    @IsNotEmpty()
    linkAM: string;

    @IsString()
    @IsNotEmpty()
    categoriaId: string;

    @IsString()
    @IsNotEmpty()
    tipoId: string;

    @IsOptional()
    @IsString()
    maquinaId?: string | null;
    
}
