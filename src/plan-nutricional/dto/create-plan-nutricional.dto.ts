import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanNutricionalDto {

    @IsString()
    @IsNotEmpty()
    linkPdf: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    pagesCount?: number;

    @IsString()
    @IsNotEmpty()
    usuarioId: string;
}
