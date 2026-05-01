import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlanNutricionalDto {

    @IsString()
    @IsNotEmpty()
    linkPdf: string;

    @IsString()
    @IsNotEmpty()
    usuarioId: string;
}
