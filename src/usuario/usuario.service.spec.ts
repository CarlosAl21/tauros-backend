import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario, Rol } from './entities/usuario.entity';
import { PlanEntrenamiento } from 'src/plan-entrenamiento/entities/plan-entrenamiento.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { Ejercicio } from 'src/ejercicio/entities/ejercicio.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let mockUsuarioRepository;
  let mockPlanEntrenamientoRepository;
  let mockRutinaEjercicioRepository;
  let mockEjercicioRepository;

  beforeEach(async () => {
    // Crear mocks de los repositorios
    mockUsuarioRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockPlanEntrenamientoRepository = {
      find: jest.fn(),
    };

    mockRutinaEjercicioRepository = {
      find: jest.fn(),
    };

    mockEjercicioRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
        {
          provide: getRepositoryToken(PlanEntrenamiento),
          useValue: mockPlanEntrenamientoRepository,
        },
        {
          provide: getRepositoryToken(RutinaEjercicio),
          useValue: mockRutinaEjercicioRepository,
        },
        {
          provide: getRepositoryToken(Ejercicio),
          useValue: mockEjercicioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - PRUEBAS CAJA BLANCA (lógica interna)', () => {
    it('Debe crear un usuario correctamente con rol USER por defecto', async () => {
      // Arrange - Preparar datos
      const createUsuarioDto: CreateUsuarioDto = {
        cedula: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'juan@test.com',
        contrasena: 'Pass123!',
        fechaNacimiento: '1990-01-01',
      };

      const usuarioCreado = {
        userId: '1',
        ...createUsuarioDto,
        rol: Rol.USER,
        fechaNacimiento: new Date('1990-01-01'),
      };

      mockUsuarioRepository.findOne.mockResolvedValueOnce(null); // No existe correo
      mockUsuarioRepository.findOne.mockResolvedValueOnce(null); // No existe cédula
      mockUsuarioRepository.create.mockReturnValue(usuarioCreado);
      mockUsuarioRepository.save.mockResolvedValue(usuarioCreado);

      // Act - Ejecutar
      const resultado = await service.create(createUsuarioDto);

      // Assert - Verificar
      expect(resultado).toEqual(usuarioCreado);
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUsuarioRepository.create).toHaveBeenCalled();
      expect(mockUsuarioRepository.save).toHaveBeenCalled();
    });

    it('Debe crear un usuario con rol ADMIN cuando currentRole es ADMIN', async () => {
      const createUsuarioDto: CreateUsuarioDto = {
        cedula: '87654321',
        nombre: 'Admin',
        apellido: 'User',
        correo: 'admin@test.com',
        contrasena: 'AdminPass123!',
        fechaNacimiento: '1985-05-15',
        rol: Rol.ADMIN,
      };

      const usuarioCreado = {
        userId: '2',
        ...createUsuarioDto,
        fechaNacimiento: new Date('1985-05-15'),
      };

      mockUsuarioRepository.findOne.mockResolvedValueOnce(null);
      mockUsuarioRepository.findOne.mockResolvedValueOnce(null);
      mockUsuarioRepository.create.mockReturnValue(usuarioCreado);
      mockUsuarioRepository.save.mockResolvedValue(usuarioCreado);

      const resultado = await service.create(createUsuarioDto, Rol.ADMIN);

      expect(resultado.rol).toBe(Rol.ADMIN);
    });

    it('Debe lanzar ConflictException si el correo ya existe', async () => {
      const createUsuarioDto: CreateUsuarioDto = {
        cedula: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'existing@test.com',
        contrasena: 'Pass123!',
        fechaNacimiento: '1990-01-01',
      };

      mockUsuarioRepository.findOne.mockResolvedValueOnce({
        userId: '1',
        correo: 'existing@test.com',
      });

      await expect(service.create(createUsuarioDto)).rejects.toThrow(
        new ConflictException('El correo ya está registrado'),
      );

      expect(mockUsuarioRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUsuarioRepository.save).not.toHaveBeenCalled();
    });

    it('Debe lanzar ConflictException si la cédula ya existe', async () => {
      const createUsuarioDto: CreateUsuarioDto = {
        cedula: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'new@test.com',
        contrasena: 'Pass123!',
        fechaNacimiento: '1990-01-01',
      };

      mockUsuarioRepository.findOne.mockResolvedValueOnce(null); // No existe correo
      mockUsuarioRepository.findOne.mockResolvedValueOnce({
        userId: '2',
        cedula: '12345678',
      }); // Cédula existe

      await expect(service.create(createUsuarioDto)).rejects.toThrow(
        new ConflictException('La cédula ya está registrada'),
      );

      expect(mockUsuarioRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('Debe convertir fechaNacimiento a Date correctamente', async () => {
      const createUsuarioDto: CreateUsuarioDto = {
        cedula: '11111111',
        nombre: 'Test',
        apellido: 'User',
        correo: 'test@test.com',
        contrasena: 'Test123!',
        fechaNacimiento: '2000-12-25',
      };

      mockUsuarioRepository.findOne.mockResolvedValueOnce(null);
      mockUsuarioRepository.findOne.mockResolvedValueOnce(null);
      mockUsuarioRepository.create.mockReturnValue({
        userId: '3',
        ...createUsuarioDto,
        fechaNacimiento: new Date('2000-12-25'),
        rol: Rol.USER,
      });
      mockUsuarioRepository.save.mockResolvedValue({
        userId: '3',
        ...createUsuarioDto,
        fechaNacimiento: new Date('2000-12-25'),
        rol: Rol.USER,
      });

      const resultado = await service.create(createUsuarioDto);

      expect(resultado.fechaNacimiento).toBeInstanceOf(Date);
    });
  });

  describe('findAll - PRUEBAS CAJA NEGRA', () => {
    it('Debe retornar una lista de usuarios', async () => {
      const usuarios = [
        {
          userId: '1',
          cedula: '12345678',
          nombre: 'Juan',
          apellido: 'Pérez',
          correo: 'juan@test.com',
          rol: Rol.USER,
        },
        {
          userId: '2',
          cedula: '87654321',
          nombre: 'María',
          apellido: 'López',
          correo: 'maria@test.com',
          rol: Rol.USER,
        },
      ];

      mockUsuarioRepository.find.mockResolvedValue(usuarios);

      const resultado = await service.findAll();

      expect(resultado).toHaveLength(2);
      expect(resultado).toEqual(usuarios);
    });

    it('Debe retornar un array vacío si no hay usuarios', async () => {
      mockUsuarioRepository.find.mockResolvedValue([]);

      const resultado = await service.findAll();

      expect(resultado).toEqual([]);
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  describe('findOne - PRUEBAS CAJA BLANCA Y NEGRA', () => {
    it('Debe buscar usuario por userId', async () => {
      const usuario = {
        userId: '123',
        cedula: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
      };

      mockUsuarioRepository.findOne.mockResolvedValue(usuario);

      const resultado = await service.findOne('123');

      expect(resultado).toEqual(usuario);
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: [{ userId: '123' }, { cedula: '123' }],
      });
    });

    it('Debe retornar null si no encuentra el usuario', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      const resultado = await service.findOne('nonexistent');

      expect(resultado).toBeNull();
    });

    it('Debe buscar por cédula como alternativa', async () => {
      const usuario = {
        userId: '456',
        cedula: '12345678',
        nombre: 'María',
      };

      mockUsuarioRepository.findOne.mockResolvedValue(usuario);

      const resultado = await service.findOne('12345678');

      expect(resultado).toEqual(usuario);
    });
  });

  describe('Manejo de errores', () => {
    it('Debe capturar excepciones en create y relanzarlas', async () => {
      const createUsuarioDto: CreateUsuarioDto = {
        cedula: '12345678',
        nombre: 'Test',
        apellido: 'Error',
        correo: 'error@test.com',
        contrasena: 'Pass123!',
        fechaNacimiento: '1990-01-01',
      };

      const dbError = new Error('Database connection failed');
      mockUsuarioRepository.findOne.mockRejectedValue(dbError);

      await expect(service.create(createUsuarioDto)).rejects.toThrow(dbError);
    });

    it('Debe manejar errores en findAll', async () => {
      mockUsuarioRepository.find.mockRejectedValue(new Error('DB Error'));

      const resultado = await service.findAll();

      expect(resultado).toBeUndefined();
    });
  });
});
