import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Evento {

    @PrimaryGeneratedColumn('uuid')
    eventoId: string;

    @Column()
    nombre: string;

    @Column()
    fechaHora: Date;

    @Column()
    numParticipantes: number;

    @Column()
    lugar: string;

    @ManyToMany(() => Usuario, usuario => usuario.eventos)
    @JoinTable({name: 'evento_participantes'})
    participantes: Usuario[];
}
