import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SugerenciaService } from './sugerencia.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('sugerencia')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('sugerencia')
export class SugerenciaController {
  constructor(private readonly sugerenciaService: SugerenciaService) {}

  @Get()
  @ApiQuery({ name: 'tipo', required: false, enum: ['EVENTO', 'RUTINA', 'EJERCICIO'] })
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll(@Query('tipo') tipo?: string) {
    return this.sugerenciaService.findAll(tipo);
  }
}
