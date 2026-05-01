import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateComposicionCorporalDto {

    @IsNumber()
    @IsNotEmpty()
    peso: number;

    @IsNumber()
    @IsOptional()
    talla?: number;

    @IsNumber()
    @IsOptional()
    grasaCorporal?: number;

    @IsNumber()
    @IsOptional()
    edadCorporal?: number;

    @IsNumber()
    @IsOptional()
    grasaVisceral?: number;

    @IsNumber()
    @IsOptional()
    masaMuscularKg?: number;

    @IsNumber()
    @IsOptional()
    masaMuscularPorcentaje?: number;

    @IsString()
    @IsOptional()
    masaMuscularTipo?: string;

    @IsString()
    @IsOptional()
    usuarioId?: string;
}
