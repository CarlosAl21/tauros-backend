import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RutinaEjercicioService } from './rutina-ejercicio.service';
import { CreateRutinaEjercicioDto } from './dto/create-rutina-ejercicio.dto';
import { UpdateRutinaEjercicioDto } from './dto/update-rutina-ejercicio.dto';

@Controller('rutina-ejercicio')
export class RutinaEjercicioController {
  constructor(private readonly rutinaEjercicioService: RutinaEjercicioService) {}

  @Post()
  create(@Body() createRutinaEjercicioDto: CreateRutinaEjercicioDto) {
    return this.rutinaEjercicioService.create(createRutinaEjercicioDto);
  }

  @Get()
  findAll() {
    return this.rutinaEjercicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rutinaEjercicioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRutinaEjercicioDto: UpdateRutinaEjercicioDto) {
    return this.rutinaEjercicioService.update(+id, updateRutinaEjercicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rutinaEjercicioService.remove(+id);
  }
}
