import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HorarioService } from './horario.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('horario')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('horario')
export class HorarioController {
  constructor(private readonly horarioService: HorarioService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  create(@Body() createHorarioDto: CreateHorarioDto) {
    return this.horarioService.create(createHorarioDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.horarioService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.horarioService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateHorarioDto: UpdateHorarioDto) {
    return this.horarioService.update(id, updateHorarioDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.horarioService.remove(id);
  }
}
