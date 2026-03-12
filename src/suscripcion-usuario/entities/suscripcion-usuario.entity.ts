import { Suscripcion } from "src/suscripcion/entities/suscripcion.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SuscripcionUsuario {

    @PrimaryGeneratedColumn('uuid')
    suscripcionUsuarioId: string;

    @Column()
    fechaInicio: Date;

    @Column()
    fechaFin: Date;

    @Column()
    isActive: boolean;

    @ManyToOne(() => Suscripcion, suscripcion => suscripcion.suscripcionUsuarios)
    @JoinColumn({ name: 'suscripcionId' })
    suscripcion: Suscripcion;

    @ManyToOne(() => Usuario, usuario => usuario.suscripcionUsuarios)
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;
    
}
