import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RutinaEjercicioService } from './rutina-ejercicio.service';
import { CreateRutinaEjercicioDto } from './dto/create-rutina-ejercicio.dto';
import { UpdateRutinaEjercicioDto } from './dto/update-rutina-ejercicio.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('rutina-ejercicio')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('rutina-ejercicio')
export class RutinaEjercicioController {
  constructor(private readonly rutinaEjercicioService: RutinaEjercicioService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  @ApiOperation({ summary: 'Crear un nuevo ejercicio de rutina con calentamientos opcionales' })
  @ApiResponse({ status: 201, description: 'Ejercicio creado exitosamente con calentamientos' })
  create(@Body() createRutinaEjercicioDto: CreateRutinaEjercicioDto) {
    return this.rutinaEjercicioService.create(createRutinaEjercicioDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  @ApiOperation({ summary: 'Obtener todos los ejercicios de rutina con sus calentamientos' })
  @ApiResponse({ status: 200, description: 'Lista de ejercicios con calentamientos asociados' })
  findAll() {
    return this.rutinaEjercicioService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  @ApiOperation({ summary: 'Obtener un ejercicio de rutina específico con sus calentamientos' })
  @ApiParam({ name: 'id', description: 'ID del ejercicio de rutina' })
  @ApiResponse({ status: 200, description: 'Ejercicio encontrado con todos sus calentamientos' })
  @ApiResponse({ status: 404, description: 'Ejercicio no encontrado' })
  findOne(@Param('id') id: string) {
    return this.rutinaEjercicioService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  @ApiOperation({ summary: 'Actualizar un ejercicio de rutina incluyendo calentamientos' })
  @ApiParam({ name: 'id', description: 'ID del ejercicio de rutina a actualizar' })
  @ApiResponse({ status: 200, description: 'Ejercicio actualizado exitosamente con calentamientos' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  update(@Param('id') id: string, @Body() updateRutinaEjercicioDto: UpdateRutinaEjercicioDto) {
    return this.rutinaEjercicioService.update(id, updateRutinaEjercicioDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  @ApiOperation({ summary: 'Eliminar un ejercicio de rutina y sus calentamientos asociados' })
  @ApiParam({ name: 'id', description: 'ID del ejercicio de rutina a eliminar' })
  @ApiResponse({ status: 200, description: 'Ejercicio eliminado exitosamente' })
  remove(@Param('id') id: string) {
    return this.rutinaEjercicioService.remove(id);
  }

  @Patch(':id/completada')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  @ApiOperation({ summary: 'Marcar un ejercicio de rutina como completada' })
  @ApiParam({ name: 'id', description: 'ID del ejercicio de rutina' })
  @ApiResponse({ status: 200, description: 'Ejercicio marcado como completada' })
  marcarCompletada(@Param('id') id: string) {
    return this.rutinaEjercicioService.marcarCompletada(id);
  }
}
