import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RutinaEjercicioService } from './rutina-ejercicio.service';
import { CreateRutinaEjercicioDto } from './dto/create-rutina-ejercicio.dto';
import { UpdateRutinaEjercicioDto } from './dto/update-rutina-ejercicio.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('rutina-ejercicio')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('rutina-ejercicio')
export class RutinaEjercicioController {
  constructor(private readonly rutinaEjercicioService: RutinaEjercicioService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  create(@Body() createRutinaEjercicioDto: CreateRutinaEjercicioDto) {
    return this.rutinaEjercicioService.create(createRutinaEjercicioDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.rutinaEjercicioService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.rutinaEjercicioService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateRutinaEjercicioDto: UpdateRutinaEjercicioDto) {
    return this.rutinaEjercicioService.update(id, updateRutinaEjercicioDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.rutinaEjercicioService.remove(id);
  }
}
