import { Ejercicio } from "src/ejercicio/entities/ejercicio.entity";
import { RutinaDia } from "src/rutina-dia/entities/rutina-dia.entity";
import { CalentamientoEjercicio } from "./calentamiento-ejercicio.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RutinaEjercicio {

    @PrimaryGeneratedColumn('uuid')
    rutinaEjercicioId: string;

    @Column()
    orden: number;

    @Column()
    series: number;

    @Column({ nullable: true })
    repeticiones: number;

    @Column({ nullable: true })
    tiempoSegundos: number;

    @Column()
    carga: string;

    @Column()
    notasEspecificas: string;

    @Column({ nullable: true })
    descansoSegundos: number;

    @Column({ default: false })
    completada: boolean;

    @Column({ nullable: true })
    fechaCompletada: Date;

    @ManyToOne(() => RutinaDia, rutinaDia => rutinaDia.rutinasEjercicio, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'rutinaDiaId' })
    rutinaDia: RutinaDia;

    @ManyToOne(() => Ejercicio, ejercicio => ejercicio.rutinasEjercicio, { nullable: true })
    @JoinColumn({ name: 'ejercicioId' })
    ejercicio: Ejercicio;

    @OneToMany(() => CalentamientoEjercicio, calentamiento => calentamiento.rutinaEjercicio, { cascade: true, onDelete: 'CASCADE' })
    calentamientos: CalentamientoEjercicio[];
}
