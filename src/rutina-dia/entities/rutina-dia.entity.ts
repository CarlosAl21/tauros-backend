import { PlanEntrenamiento } from "src/plan-entrenamiento/entities/plan-entrenamiento.entity";
import { RutinaEjercicio } from "src/rutina-ejercicio/entities/rutina-ejercicio.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RutinaDia {

    @PrimaryGeneratedColumn('uuid')
    rutinaDiaId: string;

    @Column()
    numeroDia: number;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @Column({ type: 'int', default: 60 })
    descansoSegundos: number;

    @Column({ default: false })
    finalizada: boolean;

    @Column({ nullable: true })
    fechaFinalizada: Date;

    @ManyToOne(() => PlanEntrenamiento, planEntrenamiento => planEntrenamiento.rutinasDia, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'planEntrenamientoId' })
    planEntrenamiento: PlanEntrenamiento;

    @OneToMany(() => RutinaEjercicio, rutinaEjercicio => rutinaEjercicio.rutinaDia)
    rutinasEjercicio: RutinaEjercicio[];
    
}
