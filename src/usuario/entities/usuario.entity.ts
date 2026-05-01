import * as bcrypt from 'bcrypt';
import { ComposicionCorporal } from 'src/composicion-corporal/entities/composicion-corporal.entity';
import { Evento } from 'src/evento/entities/evento.entity';
import { PlanEntrenamiento } from 'src/plan-entrenamiento/entities/plan-entrenamiento.entity';import { PlanNutricional } from "src/plan-nutricional/entities/plan-nutricional.entity";import { SuscripcionUsuario } from 'src/suscripcion-usuario/entities/suscripcion-usuario.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Rol {
    ADMIN = 'admin',
    COACH = 'coach',
    USER = 'user'
}

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column({ unique: true })
    cedula: string;

    @Column()
    nombre: string;

    @Column()
    apellido: string;

    @Column()
    fechaNacimiento: Date;

    @Column({ unique: true })
    correo: string;

    @Column()
    password: string;

    @Column()
    telefono: string;

    @Column({
        type: 'enum',
        enum: Rol,
        default: Rol.USER
    })
    rol: Rol;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => ComposicionCorporal, composicionCorporal => composicionCorporal.usuario)
    composicionCorporal: ComposicionCorporal[];

    @OneToMany(() => PlanEntrenamiento, planEntrenamiento => planEntrenamiento.usuario)
    planesEntrenamiento: PlanEntrenamiento[];

    @OneToMany(() => SuscripcionUsuario, suscripcionUsuario => suscripcionUsuario.usuario)
    suscripcionUsuarios: SuscripcionUsuario[];

    @OneToMany(() => PlanNutricional, planNutricional => planNutricional.usuario)
    planesNutricionales: PlanNutricional[];

    @ManyToMany(() => Evento, evento => evento.participantes)
    eventos: Evento[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2b$')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    async comparePassword(attempt: string): Promise<boolean> {
        return await bcrypt.compare(attempt, this.password);
    }
}