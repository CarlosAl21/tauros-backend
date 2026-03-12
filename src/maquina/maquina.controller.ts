import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MaquinaService } from './maquina.service';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';

@Controller('maquina')
export class MaquinaController {
  constructor(private readonly maquinaService: MaquinaService) {}

  @Post()
  create(@Body() createMaquinaDto: CreateMaquinaDto) {
    return this.maquinaService.create(createMaquinaDto);
  }

  @Get()
  findAll() {
    return this.maquinaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maquinaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaquinaDto: UpdateMaquinaDto) {
    return this.maquinaService.update(id, updateMaquinaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maquinaService.remove(id);
  }
}
