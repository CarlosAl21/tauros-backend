import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO para crear calentamientos de un ejercicio
 */
export class CreateCalentamientoDto {

    @ApiProperty({
        type: Number,
        description: 'Orden del calentamiento',
        example: 1,
    })
    @IsNumber()
    orden: number;

    @ApiProperty({
        type: Number,
        description: 'Duración en segundos del calentamiento',
        example: 300,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    duracionSegundos?: number;

    @ApiProperty({
        type: Number,
        description: 'Repeticiones del calentamiento',
        example: 10,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    repeticiones?: number;

    @ApiProperty({
        type: String,
        description: 'Intensidad del calentamiento (Baja, Media, Alta)',
        example: 'Baja',
        required: false,
    })
    @IsOptional()
    @IsString()
    intensidad?: string;
}

/**
 * DTO para crear ejercicios de rutina diaria
 */
export class CreateRutinaEjercicioDto {

    @ApiProperty({
        type: Number,
        description: 'Orden del ejercicio en la rutina',
        example: 1,
    })
    @IsNumber()
    orden: number;

    @ApiProperty({
        type: Number,
        description: 'Número de series',
        example: 3,
    })
    @IsNumber()
    series: number;

    @ApiProperty({
        type: Number,
        description: 'Número de repeticiones',
        example: 10,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    repeticiones?: number;

    @ApiProperty({
        type: Number,
        description: 'Tiempo de ejecución en segundos',
        example: 60,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    tiempoSegundos?: number;

    @ApiProperty({
        type: String,
        description: 'Carga del ejercicio',
        example: '20 kg',
    })
    @IsString()
    carga: string;

    @ApiProperty({
        type: String,
        description: 'Notas específicas del ejercicio',
        example: 'Mantener postura erguida',
    })
    @IsString()
    notasEspecificas: string;

    @ApiProperty({
        type: Number,
        description: 'Descanso entre series en segundos',
        example: 60,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    descansoSegundos?: number;

    @ApiProperty({
        type: String,
        description: 'ID de la rutina diaria',
        example: 'rutina-dia-uuid',
    })
    @IsString()
    @IsNotEmpty()
    rutinaDiaId: string;

    @ApiProperty({
        type: String,
        description: 'ID del ejercicio',
        example: 'ejercicio-uuid',
    })
    @IsString()
    @IsNotEmpty()
    ejercicioId: string;

    @ApiProperty({
        type: [CreateCalentamientoDto],
        description: 'Array de calentamientos para este ejercicio',
        required: false,
    })
    @IsOptional()
    @IsArray()
    calentamientos?: CreateCalentamientoDto[];
}
