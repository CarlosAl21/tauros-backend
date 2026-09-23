import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { CreateRegistroCargaDto } from './dto/create-registro-carga.dto';
import { QueryRegistroCargaDto } from './dto/query-registro-carga.dto';
import { RegistroCargaService } from './registro-carga.service';

type AuthRequest = { user?: { userId?: string; rol?: Rol } };

@ApiTags('registro-carga')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('registro-carga')
export class RegistroCargaController {
  constructor(private readonly registroCargaService: RegistroCargaService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  create(@Req() req: AuthRequest, @Body() dto: CreateRegistroCargaDto) {
    // Always recorded for the requesting user; usuarioId in the body is rejected by the global whitelist.
    return this.registroCargaService.create(this.requireUserId(req), dto);
  }

  // Static routes are declared before parameterized ones.
  @Get('me/latest')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findMyLatest(@Req() req: AuthRequest) {
    return this.registroCargaService.findLatestPerEjercicio(this.requireUserId(req));
  }

  @Get('me')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findMyHistory(@Req() req: AuthRequest, @Query() query: QueryRegistroCargaDto) {
    return this.registroCargaService.findHistory(this.requireUserId(req), query.ejercicioId);
  }

  @Get('usuario/:usuarioId/resumen')
  @Roles(Rol.ADMIN, Rol.COACH)
  findUserResumen(@Param('usuarioId', new ParseUUIDPipe()) usuarioId: string) {
    return this.registroCargaService.findResumen(usuarioId);
  }

  @Get('usuario/:usuarioId')
  @Roles(Rol.ADMIN, Rol.COACH)
  findUserHistory(
    @Param('usuarioId', new ParseUUIDPipe()) usuarioId: string,
    @Query() query: QueryRegistroCargaDto,
  ) {
    return this.registroCargaService.findHistory(usuarioId, query.ejercicioId);
  }

  private requireUserId(req: AuthRequest): string {
    if (!req.user?.userId) {
      throw new UnauthorizedException();
    }
    return req.user.userId;
  }
}
