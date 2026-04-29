import { RutinaDia } from "src/rutina-dia/entities/rutina-dia.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PlanEntrenamiento {
    
    @PrimaryGeneratedColumn('uuid')
    planEntrenamientoId: string;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @Column()
    duracionDias: number;

    @Column({default: true})
    esPlantilla: boolean;

    @Column()
    objetivo: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Usuario, usuario => usuario.planesEntrenamiento, { nullable: true })
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;

    @OneToMany(() => RutinaDia, rutinaDia => rutinaDia.planEntrenamiento)
    rutinasDia: RutinaDia[];

}
