import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ComposicionCorporalService } from './composicion-corporal.service';
import { CreateComposicionCorporalDto } from './dto/create-composicion-corporal.dto';
import { UpdateComposicionCorporalDto } from './dto/update-composicion-corporal.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('composicion-corporal')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('composicion-corporal')
export class ComposicionCorporalController {
  constructor(private readonly composicionCorporalService: ComposicionCorporalService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  create(@Body() createComposicionCorporalDto: CreateComposicionCorporalDto) {
    return this.composicionCorporalService.create(createComposicionCorporalDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.composicionCorporalService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.composicionCorporalService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateComposicionCorporalDto: UpdateComposicionCorporalDto) {
    return this.composicionCorporalService.update(id, updateComposicionCorporalDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.composicionCorporalService.remove(id);
  }
}
