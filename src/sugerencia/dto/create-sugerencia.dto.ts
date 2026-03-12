import { IsNotEmpty, IsString } from "class-validator";

enum tipoEntidad {
    EVENTO = 'EVENTO',
    RUTINA = 'RUTINA',
    EJERCICIO = 'EJERCICIO'
}

export class CreateSugerenciaDto {

    @IsString()
    @IsNotEmpty()
    contenido: string;

    @IsString()
    @IsNotEmpty()
    tipoEntidad: tipoEntidad;

    @IsString()
    @IsNotEmpty()
    entidadId: string;
}
