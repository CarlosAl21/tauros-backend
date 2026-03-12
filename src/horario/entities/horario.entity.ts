import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Horario {

    @PrimaryGeneratedColumn('uuid')
    horarioId: string;

    @Column()
    apertura: string;

    @Column()
    cierre: string;

    @Column()
    diasSemanales: string;
}
