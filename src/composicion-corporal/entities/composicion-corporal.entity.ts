import { Usuario } from "src/usuario/entities/usuario.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

@Entity()
export class ComposicionCorporal {

    @PrimaryGeneratedColumn('uuid')
    composicionCorporalId: string;

    @Column()
    peso: number;

    @Column({ nullable: true })
    talla: number;

    @Column({ nullable: true })
    grasaCorporal: number;

    @Column({ nullable: true })
    edadCorporal: number;

    @Column({ nullable: true })
    grasaVisceral: number;

    @Column({default: () => 'CURRENT_TIMESTAMP'})
    fechaRegistro: Date;

    @ManyToOne(() => Usuario, usuario => usuario.composicionCorporal)
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;

    @RelationId((composicionCorporal: ComposicionCorporal) => composicionCorporal.usuario)
    usuarioId: string;
    

}
