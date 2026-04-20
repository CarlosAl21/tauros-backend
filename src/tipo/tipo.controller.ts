import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TipoService } from './tipo.service';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('tipo')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('tipo')
export class TipoController {
  constructor(private readonly tipoService: TipoService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  create(@Body() createTipoDto: CreateTipoDto) {
    return this.tipoService.create(createTipoDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.tipoService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.tipoService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateTipoDto: UpdateTipoDto) {
    return this.tipoService.update(id, updateTipoDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.tipoService.remove(id);
  }
}
