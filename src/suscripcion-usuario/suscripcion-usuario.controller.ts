import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SuscripcionUsuarioService } from './suscripcion-usuario.service';
import { CreateSuscripcionUsuarioDto } from './dto/create-suscripcion-usuario.dto';
import { UpdateSuscripcionUsuarioDto } from './dto/update-suscripcion-usuario.dto';

@Controller('suscripcion-usuario')
export class SuscripcionUsuarioController {
  constructor(private readonly suscripcionUsuarioService: SuscripcionUsuarioService) {}

  @Post()
  create(@Body() createSuscripcionUsuarioDto: CreateSuscripcionUsuarioDto) {
    return this.suscripcionUsuarioService.create(createSuscripcionUsuarioDto);
  }

  @Get()
  findAll() {
    return this.suscripcionUsuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suscripcionUsuarioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSuscripcionUsuarioDto: UpdateSuscripcionUsuarioDto) {
    return this.suscripcionUsuarioService.update(+id, updateSuscripcionUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suscripcionUsuarioService.remove(+id);
  }
}
