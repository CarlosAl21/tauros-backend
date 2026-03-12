import { SuscripcionUsuario } from "src/suscripcion-usuario/entities/suscripcion-usuario.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Suscripcion {
    @PrimaryGeneratedColumn('uuid')
    suscripcionId: string;

    @Column()
    nombre: string;

    @Column()
    precio: number;

    @Column()
    beneficios: string;

    @OneToMany(() => SuscripcionUsuario, suscripcionUsuario => suscripcionUsuario.suscripcion)
    suscripcionUsuarios: SuscripcionUsuario[];
}
