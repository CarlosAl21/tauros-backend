import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RutinaDiaService } from './rutina-dia.service';
import { CreateRutinaDiaDto } from './dto/create-rutina-dia.dto';
import { UpdateRutinaDiaDto } from './dto/update-rutina-dia.dto';

@Controller('rutina-dia')
export class RutinaDiaController {
  constructor(private readonly rutinaDiaService: RutinaDiaService) {}

  @Post()
  create(@Body() createRutinaDiaDto: CreateRutinaDiaDto) {
    return this.rutinaDiaService.create(createRutinaDiaDto);
  }

  @Get()
  findAll() {
    return this.rutinaDiaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rutinaDiaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRutinaDiaDto: UpdateRutinaDiaDto) {
    return this.rutinaDiaService.update(id, updateRutinaDiaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rutinaDiaService.remove(id);
  }
}
