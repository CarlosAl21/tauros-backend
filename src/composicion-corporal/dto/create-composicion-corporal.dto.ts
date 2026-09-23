import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateComposicionCorporalDto {

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    peso: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    talla?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    grasaCorporal?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    edadCorporal?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    grasaVisceral?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    masaMuscularKg?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    masaMuscularPorcentaje?: number;

    @IsString()
    @IsOptional()
    usuarioId?: string;
}
