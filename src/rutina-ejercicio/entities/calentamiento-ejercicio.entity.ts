import { RutinaEjercicio } from "./rutina-ejercicio.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CalentamientoEjercicio {

    @PrimaryGeneratedColumn('uuid')
    calentamientoId: string;

    @Column()
    orden: number;

    @Column({ nullable: true })
    duracionSegundos: number;

    @Column({ nullable: true })
    repeticiones: number;

    @Column({ type: 'varchar', default: 'baja' })
    intensidad: string;

    @ManyToOne(() => RutinaEjercicio, rutinaEjercicio => rutinaEjercicio.calentamientos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'rutinaEjercicioId' })
    rutinaEjercicio: RutinaEjercicio;
}
