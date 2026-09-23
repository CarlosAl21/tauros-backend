import { ApiProperty } from "@nestjs/swagger";
import { UNIDADES_CARGA, UnidadCarga } from "../entities/registro-carga.entity";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID, Max } from "class-validator";

export class CreateRegistroCargaDto {

    @ApiProperty({ description: 'Base exercise id', format: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    ejercicioId: string;

    @ApiProperty({ description: 'Lifted load in kg (max 2 decimals)', example: 20.41 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Max(9999.99)
    cargaKg: number;

    @ApiProperty({ description: 'Routine exercise context', format: 'uuid', required: false })
    @IsUUID()
    @IsOptional()
    rutinaEjercicioId?: string;

    @ApiProperty({ description: 'Unit the load was entered in (cargaKg is always kg)', enum: UNIDADES_CARGA, required: false, default: 'kg' })
    @IsIn(UNIDADES_CARGA)
    @IsOptional()
    unidad?: UnidadCarga;
}
