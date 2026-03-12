import { Categoria } from "src/categoria/entities/categoria.entity";
import { Maquina } from "src/maquina/entities/maquina.entity";
import { RutinaEjercicio } from "src/rutina-ejercicio/entities/rutina-ejercicio.entity";
import { Tipo } from "src/tipo/entities/tipo.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ejercicio {

    @PrimaryGeneratedColumn('uuid')
    ejercicioId: string;

    @Column()
    nombre: string;

    @Column()
    linkVideo: string;

    @Column()
    linkAM: string;

    @ManyToOne(() => Categoria, categoria => categoria.ejercicios)
    @JoinColumn({ name: 'categoriaId' })
    categoria: Categoria;

    @ManyToOne(() => Tipo, tipo => tipo.ejercicios)
    @JoinColumn({ name: 'tipoId' })
    tipo: Tipo;

    @OneToMany(() => RutinaEjercicio, rutinaEjercicio => rutinaEjercicio.ejercicio)
    rutinasEjercicio: RutinaEjercicio[];

    @ManyToOne(() => Maquina, maquina => maquina.ejercicios)
    @JoinColumn({ name: 'maquinaId' })
    maquina: Maquina;
    
}
