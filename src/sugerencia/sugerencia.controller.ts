import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SugerenciaService } from './sugerencia.service';
import { CreateSugerenciaDto } from './dto/create-sugerencia.dto';
import { UpdateSugerenciaDto } from './dto/update-sugerencia.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('sugerencia')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('sugerencia')
export class SugerenciaController {
  constructor(private readonly sugerenciaService: SugerenciaService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  create(@Body() createSugerenciaDto: CreateSugerenciaDto) {
    return this.sugerenciaService.create(createSugerenciaDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.sugerenciaService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.sugerenciaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateSugerenciaDto: UpdateSugerenciaDto) {
    return this.sugerenciaService.update(id, updateSugerenciaDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.sugerenciaService.remove(id);
  }
}
