import { decimalTransformer } from "src/common/transformers/decimal.transformer";
import { Ejercicio } from "src/ejercicio/entities/ejercicio.entity";
import { RutinaEjercicio } from "src/rutina-ejercicio/entities/rutina-ejercicio.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

export const UNIDADES_CARGA = ['kg', 'lb'] as const;
export type UnidadCarga = (typeof UNIDADES_CARGA)[number];

/**
 * History of the load (kg) a user lifted on a base exercise. Tracked per
 * Ejercicio so progress survives routine changes; RutinaEjercicio is optional
 * context only.
 */
@Entity()
@Index(['usuario', 'ejercicio', 'fechaRegistro'])
export class RegistroCarga {

    @PrimaryGeneratedColumn('uuid')
    registroCargaId: string;

    @ManyToOne(() => Usuario, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;

    @RelationId((registro: RegistroCarga) => registro.usuario)
    usuarioId: string;

    @ManyToOne(() => Ejercicio, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ejercicioId' })
    ejercicio: Ejercicio;

    @RelationId((registro: RegistroCarga) => registro.ejercicio)
    ejercicioId: string;

    @ManyToOne(() => RutinaEjercicio, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'rutinaEjercicioId' })
    rutinaEjercicio: RutinaEjercicio | null;

    @RelationId((registro: RegistroCarga) => registro.rutinaEjercicio)
    rutinaEjercicioId: string | null;

    @Column('numeric', { precision: 6, scale: 2, transformer: decimalTransformer })
    cargaKg: number;

    /** Unit the user typed the load in; cargaKg remains the canonical value. */
    @Column({ type: 'varchar', length: 2, default: 'kg' })
    unidad: UnidadCarga;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    fechaRegistro: Date;
}
