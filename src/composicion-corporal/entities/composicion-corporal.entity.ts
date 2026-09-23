import { Usuario } from "src/usuario/entities/usuario.entity";
import { decimalTransformer } from "src/common/transformers/decimal.transformer";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

@Entity()
export class ComposicionCorporal {

    @PrimaryGeneratedColumn('uuid')
    composicionCorporalId: string;

    @Column('numeric', { precision: 6, scale: 2, transformer: decimalTransformer })
    peso: number;

    @Column('numeric', { precision: 6, scale: 2, nullable: true, transformer: decimalTransformer })
    talla: number;

    @Column('numeric', { precision: 6, scale: 2, nullable: true, transformer: decimalTransformer })
    grasaCorporal: number;

    @Column('numeric', { precision: 6, scale: 2, nullable: true, transformer: decimalTransformer })
    edadCorporal: number;

    @Column('numeric', { precision: 6, scale: 2, nullable: true, transformer: decimalTransformer })
    grasaVisceral: number;

    @Column('numeric', { precision: 6, scale: 2, nullable: true, transformer: decimalTransformer })
    masaMuscularKg: number;

    @Column('numeric', { precision: 6, scale: 2, nullable: true, transformer: decimalTransformer })
    masaMuscularPorcentaje: number;

    @Column({default: () => 'CURRENT_TIMESTAMP'})
    fechaRegistro: Date;

    @ManyToOne(() => Usuario, usuario => usuario.composicionCorporal)
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;

    @RelationId((composicionCorporal: ComposicionCorporal) => composicionCorporal.usuario)
    usuarioId: string;
    

}
