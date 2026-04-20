import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('evento')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('evento')
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventoService.create(createEventoDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.eventoService.findAll();
  }

  @Get('activos')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findActivos() {
    return this.eventoService.findActivos();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.eventoService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventoService.update(id, updateEventoDto);
  }

  @Post(':eventoId/participantes/:usuarioId')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  registrarParticipante(@Param('eventoId') eventoId: string, @Param('usuarioId') usuarioId: string) {
    return this.eventoService.registrarParticipante(eventoId, usuarioId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.eventoService.remove(id);
  }
}
