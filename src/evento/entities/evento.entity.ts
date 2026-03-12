import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Evento {

    @PrimaryGeneratedColumn('uuid')
    eventoId: string;

    @Column()
    nombre: string;

    @Column({ type: 'timestamptz' })
    fechaHora: Date;

    @Column({default: 0})
    numParticipantes: number;

    @Column()
    lugar: string;

    @Column()
    descripcion: string;

    @Column({default: true})
    activo: boolean;

    @ManyToMany(() => Usuario, usuario => usuario.eventos)
    @JoinTable({name: 'evento_participantes'})
    participantes: Usuario[];
}
