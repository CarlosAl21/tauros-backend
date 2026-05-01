import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { ComposicionCorporalModule } from './composicion-corporal/composicion-corporal.module';
import { PlanEntrenamientoModule } from './plan-entrenamiento/plan-entrenamiento.module';
import { PlanNutricionalModule } from './plan-nutricional/plan-nutricional.module';
import { RutinaDiaModule } from './rutina-dia/rutina-dia.module';
import { RutinaEjercicioModule } from './rutina-ejercicio/rutina-ejercicio.module';
import { EjercicioModule } from './ejercicio/ejercicio.module';
import { MaquinaModule } from './maquina/maquina.module';
import { SuscripcionModule } from './suscripcion/suscripcion.module';
import { SuscripcionUsuarioModule } from './suscripcion-usuario/suscripcion-usuario.module';
import { HorarioModule } from './horario/horario.module';
import { EventoModule } from './evento/evento.module';
import { SugerenciaModule } from './sugerencia/sugerencia.module';
import { CategoriaModule } from './categoria/categoria.module';
import { TipoModule } from './tipo/tipo.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appSchema = configService.get('DB_SCHEMA', 'tauros_app');
        const extensionSchema = configService.get('DB_EXTENSION_SCHEMA', appSchema);
        const quoteSchema = (schema: string) => `"${schema.replace(/"/g, '""')}"`;
        const searchPath = `${quoteSchema(appSchema)},${quoteSchema(extensionSchema)},public`;
        const useSsl = configService.get('DB_SSL', configService.get('RENDER') ? 'true' : 'false') === 'true';

        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_NAME', 'tauros_db'),
          schema: appSchema,
          extra: {
            options: `-c search_path=${searchPath}`,
            max: 15,
            idleTimeoutMillis: 30000,
          },
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV', 'development') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
    }),
    UsuarioModule,
    ComposicionCorporalModule,
    PlanEntrenamientoModule,
    PlanNutricionalModule,
    RutinaDiaModule,
    RutinaEjercicioModule,
    EjercicioModule,
    MaquinaModule,
    SuscripcionModule,
    SuscripcionUsuarioModule,
    HorarioModule,
    EventoModule,
    SugerenciaModule,
    CategoriaModule,
    TipoModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
