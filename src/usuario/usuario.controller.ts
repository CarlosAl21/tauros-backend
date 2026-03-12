import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from './entities/usuario.entity';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN, Rol.COACH)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN, Rol.COACH)
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.USER)
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Patch('cedula/:cedula')
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN, Rol.COACH)
  updateByCedula(@Param('cedula') cedula: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.updateByCedula(cedula, updateUsuarioDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN, Rol.USER)
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
