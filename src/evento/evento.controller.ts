import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@Controller('evento')
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Post()
  create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventoService.create(createEventoDto);
  }

  @Get()
  findAll() {
    return this.eventoService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.eventoService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventoService.update(id, updateEventoDto);
  }

  @Post(':eventoId/participantes/:usuarioId')
  registrarParticipante(@Param('eventoId') eventoId: string, @Param('usuarioId') usuarioId: string) {
    return this.eventoService.registrarParticipante(eventoId, usuarioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventoService.remove(id);
  }
}
