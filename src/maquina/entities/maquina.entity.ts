import { Ejercicio } from "src/ejercicio/entities/ejercicio.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Maquina {

    @PrimaryGeneratedColumn('uuid')
    maquinaId: string;

    @Column()
    nombre: string;

    @Column()
    linkFoto: string;

    @Column()
    numeroMaquina: number;

    @OneToMany(() => Ejercicio, ejercicio => ejercicio.maquina)
    ejercicios: Ejercicio[];

}
