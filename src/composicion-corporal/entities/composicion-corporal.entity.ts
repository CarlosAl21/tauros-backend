import { Usuario } from "src/usuario/entities/usuario.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ComposicionCorporal {

    @PrimaryGeneratedColumn('uuid')
    composicionCorporalId: string;

    @Column()
    peso: number;

    @Column()
    talla: number;

    @Column()
    grasaCorporal: number;

    @Column()
    edadCorporal: number;

    @Column()
    grasaVisceral: number;

    @Column({default: () => 'CURRENT_TIMESTAMP'})
    fechaRegistro: Date;

    @ManyToOne(() => Usuario, usuario => usuario.composicionCorporal)
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;
    

}
