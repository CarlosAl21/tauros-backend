import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SuscripcionUsuarioService } from './suscripcion-usuario.service';
import { CreateSuscripcionUsuarioDto } from './dto/create-suscripcion-usuario.dto';
import { UpdateSuscripcionUsuarioDto } from './dto/update-suscripcion-usuario.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('suscripcion-usuario')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('suscripcion-usuario')
export class SuscripcionUsuarioController {
  constructor(private readonly suscripcionUsuarioService: SuscripcionUsuarioService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  create(@Body() createSuscripcionUsuarioDto: CreateSuscripcionUsuarioDto) {
    return this.suscripcionUsuarioService.create(createSuscripcionUsuarioDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.suscripcionUsuarioService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.suscripcionUsuarioService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateSuscripcionUsuarioDto: UpdateSuscripcionUsuarioDto) {
    return this.suscripcionUsuarioService.update(+id, updateSuscripcionUsuarioDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.suscripcionUsuarioService.remove(+id);
  }
}
