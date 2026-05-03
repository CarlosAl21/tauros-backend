import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Rol, Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { PlanEntrenamiento } from 'src/plan-entrenamiento/entities/plan-entrenamiento.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { Ejercicio } from 'src/ejercicio/entities/ejercicio.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(PlanEntrenamiento)
    private readonly planEntrenamientoRepository: Repository<PlanEntrenamiento>,
    @InjectRepository(RutinaEjercicio)
    private readonly rutinaEjercicioRepository: Repository<RutinaEjercicio>,
    @InjectRepository(Ejercicio)
    private readonly ejercicioRepository: Repository<Ejercicio>,
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
        relations: ['rutinasDia', 'rutinasDia.rutinasEjercicio', 'rutinasDia.rutinasEjercicio.ejercicio', 'rutinasDia.rutinasEjercicio.calentamientos'],
        order: {
          createdAt: 'DESC',
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
          planCreatedAt: plan.createdAt,
          rutinaDiaId: rutina.rutinaDiaId,
          numeroDia: rutina.numeroDia,
          nombre: rutina.nombre,
          descripcion: rutina.descripcion,
          descansoSegundos: rutina.descansoSegundos,
          finalizada: rutina.finalizada,
          fechaFinalizada: rutina.fechaFinalizada,
          ejercicios: (rutina.rutinasEjercicio || []).map((rutinaEjercicio) => ({
            rutinaEjercicioId: rutinaEjercicio.rutinaEjercicioId,
            orden: rutinaEjercicio.orden,
            series: rutinaEjercicio.series,
            repeticiones: rutinaEjercicio.repeticiones,
            carga: rutinaEjercicio.carga,
            notasEspecificas: rutinaEjercicio.notasEspecificas,
            completada: rutinaEjercicio.completada,
            fechaCompletada: rutinaEjercicio.fechaCompletada,
            ejercicioId: rutinaEjercicio.ejercicio?.ejercicioId || null,
            ejercicioNombre: rutinaEjercicio.ejercicio?.nombre || 'Ejercicio sin nombre',
            calentamientos: rutinaEjercicio.calentamientos || [],
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

  async activate(id: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { userId: id },
      });

      if (!usuario) {
        console.warn(`Usuario con ID ${id} no encontrado para activación`);
        return null;
      }

      usuario.isActive = true;
      await this.usuarioRepository.save(usuario);
      return { message: `Usuario con ID ${id} activado correctamente` };
    } catch (error) {
      console.error('Error activando usuario:', error);
    }
  }

  async obtenerEstadisticasUsuario(userId: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { userId },
      });

      if (!usuario) {
        return null;
      }

      // Obtener todos los planes asignados del usuario
      const planesAsignados = await this.planEntrenamientoRepository.find({
        where: {
          usuario: { userId },
          esPlantilla: false,
        },
        relations: ['rutinasDia', 'rutinasDia.rutinasEjercicio', 'rutinasDia.rutinasEjercicio.ejercicio', 'rutinasDia.rutinasEjercicio.ejercicio.categoria'],
        order: {
          createdAt: 'DESC',
          rutinasDia: {
            numeroDia: 'ASC',
            rutinasEjercicio: {
              orden: 'ASC',
            },
          },
        },
      });

      // Obtener todos los rutinaEjercicio del usuario
      const planIds = planesAsignados.map(p => p.planEntrenamientoId);
      
      let ejerciciosUsuario = [];
      if (planIds.length > 0) {
        ejerciciosUsuario = await this.rutinaEjercicioRepository
          .createQueryBuilder('re')
          .innerJoinAndSelect('re.ejercicio', 'e')
          .innerJoinAndSelect('e.categoria', 'c')
          .innerJoinAndSelect('re.rutinaDia', 'rd')
          .innerJoin('rd.planEntrenamiento', 'p')
          .where('p.planEntrenamientoId IN (:...planIds)', { planIds })
          .getMany();
      }

      // Ejercicios más frecuentes
      const ejerciciosFrequencia = new Map();
      ejerciciosUsuario.forEach((re) => {
        const eId = re.ejercicio.ejercicioId;
        if (!ejerciciosFrequencia.has(eId)) {
          ejerciciosFrequencia.set(eId, {
            id: eId,
            nombre: re.ejercicio.nombre,
            cantidad: 0,
            completadas: 0,
          });
        }
        const current = ejerciciosFrequencia.get(eId);
        current.cantidad += 1;
        if (re.completada) {
          current.completadas += 1;
        }
      });

      const ejerciciosMasHechos = Array.from(ejerciciosFrequencia.values())
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);

      // Categorías favoritas
      const categoriasMap = new Map();
      ejerciciosUsuario.forEach((re) => {
        const catId = re.ejercicio.categoria.categoriaId;
        if (!categoriasMap.has(catId)) {
          categoriasMap.set(catId, {
            id: catId,
            nombre: re.ejercicio.categoria.nombre,
            cantidad: 0,
          });
        }
        categoriasMap.get(catId).cantidad += 1;
      });

      const categoriasFavoritas = Array.from(categoriasMap.values())
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      // Estadísticas de completadas
      const totalEjercicios = ejerciciosUsuario.length;
      const completadas = ejerciciosUsuario.filter(e => e.completada).length;
      const pendientes = totalEjercicios - completadas;
      const porcentajeCompletado = totalEjercicios > 0 
        ? Math.round((completadas / totalEjercicios) * 100)
        : 0;

      return {
        usuario: {
          userId: usuario.userId,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
        },
        planesActivos: planesAsignados.length,
        ejerciciosFrequencia: ejerciciosMasHechos,
        categoriasFavoritas,
        estadisticas: {
          total: totalEjercicios,
          completadas,
          pendientes,
          porcentaje: porcentajeCompletado,
        },
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del usuario:', error);
      return null;
    }
  }
}
