import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Rol, Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { PlanEntrenamiento } from 'src/plan-entrenamiento/entities/plan-entrenamiento.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(PlanEntrenamiento)
    private readonly planEntrenamientoRepository: Repository<PlanEntrenamiento>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto, currentRole?: Rol) {
    try {
      const existingUserByEmail = await this.usuarioRepository.findOne({
        where: { correo: createUsuarioDto.correo },
      });

      if (existingUserByEmail) {
        throw new ConflictException('El correo ya está registrado');
      }

      const existingUserByCedula = await this.usuarioRepository.findOne({
        where: { cedula: createUsuarioDto.cedula },
      });

      if (existingUserByCedula) {
        throw new ConflictException('La cédula ya está registrada');
      }

      const rol = currentRole === Rol.ADMIN ? (createUsuarioDto.rol ?? Rol.USER) : Rol.USER;
      const usuario = this.usuarioRepository.create({
        ...createUsuarioDto,
        fechaNacimiento: new Date(createUsuarioDto.fechaNacimiento),
        rol,
      });

      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.usuarioRepository.find();
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  }

  async findOne(idOrCedula: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: [
          { userId: idOrCedula },
          { cedula: idOrCedula },
        ],
      });
      if (!usuario) {
        console.warn(`Usuario con ${idOrCedula} no encontrado`);
        return null;
      }
      return usuario;
    } catch (error) {
      console.error('Error fetching usuario:', error);
    }
  }

  async findDetalleRutinas(id: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { userId: id },
      });

      if (!usuario) {
        console.warn(`Usuario con ID ${id} no encontrado para detalle`);
        return null;
      }

      const planesAsignados = await this.planEntrenamientoRepository.find({
        where: {
          usuario: { userId: id },
          esPlantilla: false,
        },
        relations: ['rutinasDia', 'rutinasDia.rutinasEjercicio', 'rutinasDia.rutinasEjercicio.ejercicio'],
        order: {
          nombre: 'ASC',
          rutinasDia: {
            numeroDia: 'ASC',
            rutinasEjercicio: {
              orden: 'ASC',
            },
          },
        },
      });

      const rutinasAsignadas = planesAsignados.flatMap((plan) =>
        (plan.rutinasDia || []).map((rutina) => ({
          planEntrenamientoId: plan.planEntrenamientoId,
          planNombre: plan.nombre,
          rutinaDiaId: rutina.rutinaDiaId,
          numeroDia: rutina.numeroDia,
          nombre: rutina.nombre,
          descripcion: rutina.descripcion,
          ejercicios: (rutina.rutinasEjercicio || []).map((rutinaEjercicio) => ({
            rutinaEjercicioId: rutinaEjercicio.rutinaEjercicioId,
            orden: rutinaEjercicio.orden,
            series: rutinaEjercicio.series,
            repeticiones: rutinaEjercicio.repeticiones,
            carga: rutinaEjercicio.carga,
            notasEspecificas: rutinaEjercicio.notasEspecificas,
            ejercicioId: rutinaEjercicio.ejercicio?.ejercicioId || null,
            ejercicioNombre: rutinaEjercicio.ejercicio?.nombre || 'Ejercicio sin nombre',
          })),
        })),
      );

      return {
        usuario: {
          userId: usuario.userId,
          cedula: usuario.cedula,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
        },
        rutinasAsignadas,
      };
    } catch (error) {
      console.error('Error fetching detalle de rutinas del usuario:', error);
    }
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { userId: id },
      });
      if (!usuario) {
        console.warn(`Usuario con ID ${id} no encontrado para actualización`);
        return null;
      }
      await this.usuarioRepository.merge(usuario, updateUsuarioDto);
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  }

  async updateByCedula(cedula: string, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { cedula: cedula },
      });
      if (!usuario) {
        console.warn(`Usuario con cédula ${cedula} no encontrado para actualización`);
        return null;
      }
      await this.usuarioRepository.merge(usuario, updateUsuarioDto);
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      console.error('Error actualizando usuario por cédula:', error);
    }
  }

  async remove(id: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { userId: id },
      });
      
      if (!usuario) {
        console.warn(`Usuario con ID ${id} no encontrado para eliminación`);
        return null;
      }
      usuario.isActive = false;
      await this.usuarioRepository.save(usuario);
      return { message: `Usuario con ID ${id} eliminado correctamente` };
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  }
}
