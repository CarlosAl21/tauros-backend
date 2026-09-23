import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, BadRequestException, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
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
  async findAll(@Req() req: { user?: { userId?: string; rol?: Rol } }) {
    // USER role only sees their own records; ADMIN/COACH see all.
    const usuarioId = this.ownerScope(req);
    try {
      return await this.composicionCorporalService.findAll(usuarioId);
    } catch (err) {
      Logger.error('Error en findAll composicion-corporal', err?.stack || err?.message || err);
      throw new InternalServerErrorException('Error interno al obtener composiciones corporales');
    }
  }

  // Must be declared before @Get(':id') so it is not shadowed.
  @Get('me/latest')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findMyLatest(@Req() req: { user?: { userId?: string; rol?: Rol } }) {
    if (!req.user?.userId) {
      throw new UnauthorizedException();
    }
    return this.composicionCorporalService.findLatestByUsuario(req.user.userId);
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Req() req: { user?: { userId?: string; rol?: Rol } }, @Param('id') id: string) {
    // USER role may only read their own records.
    const usuarioId = this.ownerScope(req);
    return this.composicionCorporalService.findOne(id, usuarioId);
  }

  /**
   * Returns the user id to scope queries by for USER role, or undefined for
   * ADMIN/COACH. Fails closed if a USER token carries no user id.
   */
  private ownerScope(req: { user?: { userId?: string; rol?: Rol } }): string | undefined {
    if (req.user?.rol !== Rol.USER) {
      return undefined;
    }
    if (!req.user.userId) {
      throw new UnauthorizedException();
    }
    return req.user.userId;
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
