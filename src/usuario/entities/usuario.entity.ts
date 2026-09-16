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

    @Column({ unique: true, nullable: true })
    cedula: string | null;

    @Column()
    nombre: string;

    @Column()
    apellido: string;

    @Column({ nullable: true })
    fechaNacimiento: Date | null;

    @Column({ unique: true })
    correo: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    telefono: string | null;

    @Column({
        type: 'enum',
        enum: Rol,
        default: Rol.USER
    })
    rol: Rol;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    twoFactorEnabled: boolean;

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