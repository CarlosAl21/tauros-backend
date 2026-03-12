import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

enum tipoEntidad {
    EVENTO = 'EVENTO',
    RUTINA = 'RUTINA',
    EJERCICIO = 'EJERCICIO'
}

@Entity()
export class Sugerencia {

    @PrimaryGeneratedColumn('uuid')
    sugerenciaId: string;

    @Column()
    contenido: string;
    
    @Column()
    tipoEntidad: tipoEntidad;

    @Column()
    entidadId: string;

}
