import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, BadRequestException } from '@nestjs/common';
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
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  create(@Req() req: { user?: { userId?: string; rol?: Rol } }, @Body() createComposicionCorporalDto: CreateComposicionCorporalDto) {
    if ((req.user?.rol === Rol.ADMIN || req.user?.rol === Rol.COACH) && !createComposicionCorporalDto.usuarioId) {
      throw new BadRequestException('Debes indicar el usuario al registrar la composicion corporal');
    }

    if (req.user?.rol === Rol.USER) {
      createComposicionCorporalDto.usuarioId = req.user.userId;
    }

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
