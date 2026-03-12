import { IsNotEmpty, IsString } from "class-validator";

export class CreateHorarioDto {
    
    @IsString()
    @IsNotEmpty()
    apertura: string;

    @IsString()
    @IsNotEmpty()
    cierre: string;

    @IsString()
    @IsNotEmpty()
    diasSemanales: string;
}
