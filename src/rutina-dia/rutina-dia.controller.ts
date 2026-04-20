import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RutinaDiaService } from './rutina-dia.service';
import { CreateRutinaDiaDto } from './dto/create-rutina-dia.dto';
import { UpdateRutinaDiaDto } from './dto/update-rutina-dia.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('rutina-dia')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('rutina-dia')
export class RutinaDiaController {
  constructor(private readonly rutinaDiaService: RutinaDiaService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  create(@Body() createRutinaDiaDto: CreateRutinaDiaDto) {
    return this.rutinaDiaService.create(createRutinaDiaDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.rutinaDiaService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.rutinaDiaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateRutinaDiaDto: UpdateRutinaDiaDto) {
    return this.rutinaDiaService.update(id, updateRutinaDiaDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.rutinaDiaService.remove(id);
  }
}
