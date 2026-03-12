import { Ejercicio } from "src/ejercicio/entities/ejercicio.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Categoria {

    @PrimaryGeneratedColumn('uuid')
    categoriaId: string;

    @Column()
    nombre: string;

    @OneToMany(() => Ejercicio, ejercicio => ejercicio.tipo)
    ejercicios: Ejercicio[];
}
