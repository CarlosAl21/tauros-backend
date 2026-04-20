import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SuscripcionService } from './suscripcion.service';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('suscripcion')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('suscripcion')
export class SuscripcionController {
  constructor(private readonly suscripcionService: SuscripcionService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  create(@Body() createSuscripcionDto: CreateSuscripcionDto) {
    return this.suscripcionService.create(createSuscripcionDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.suscripcionService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.suscripcionService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateSuscripcionDto: UpdateSuscripcionDto) {
    return this.suscripcionService.update(+id, updateSuscripcionDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.suscripcionService.remove(+id);
  }
}
