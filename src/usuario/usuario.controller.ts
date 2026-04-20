import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from './entities/usuario.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('usuario')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Patch('cedula/:cedula')
  @Roles(Rol.ADMIN, Rol.COACH)
  updateByCedula(@Param('cedula') cedula: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.updateByCedula(cedula, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
