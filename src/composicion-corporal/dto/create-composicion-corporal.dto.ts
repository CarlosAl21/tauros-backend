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

    @IsString()
    @IsNotEmpty()
    usuarioId: string;
}
