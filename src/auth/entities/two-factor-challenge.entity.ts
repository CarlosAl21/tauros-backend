import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

export enum TwoFactorPurpose {
  LOGIN = 'login',
  ENABLE = 'enable',
}

@Entity()
export class TwoFactorChallenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @Column({ type: 'enum', enum: TwoFactorPurpose })
  purpose: TwoFactorPurpose;

  @Column()
  codeHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ default: false })
  consumed: boolean;

  @Column({ default: 0 })
  attempts: number;

  @CreateDateColumn()
  createdAt: Date;
}
