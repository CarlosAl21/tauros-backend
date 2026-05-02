import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PlanNutricional {

    @PrimaryGeneratedColumn('uuid')
    planNutricionalId: string;

    @Column()
    linkPdf: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Usuario, usuario => usuario.planesNutricionales, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;
}
