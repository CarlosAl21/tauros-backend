import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SugerenciaService } from './sugerencia.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateSugerenciaDto } from './dto/create-sugerencia.dto';
import { UpdateSugerenciaDto } from './dto/update-sugerencia.dto';

@ApiTags('sugerencia')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('sugerencia')
export class SugerenciaController {
  constructor(private readonly sugerenciaService: SugerenciaService) {}

  @Get()
  @ApiQuery({ name: 'tipo', required: false, enum: ['EVENTO', 'RUTINA', 'EJERCICIO'] })
  @ApiQuery({ name: 'solucionada', required: false, enum: ['true', 'false'] })
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll(@Query('tipo') tipo?: string, @Query('solucionada') solucionada?: string) {
    return this.sugerenciaService.findAll(tipo, solucionada);
  }

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  create(@Body() createSugerenciaDto: CreateSugerenciaDto) {
    return this.sugerenciaService.create(createSugerenciaDto);
  }

  @Patch(':id/estado')
  @Roles(Rol.ADMIN, Rol.COACH)
  updateEstado(@Param('id') id: string, @Body() updateSugerenciaDto: UpdateSugerenciaDto) {
    return this.sugerenciaService.updateEstado(id, updateSugerenciaDto);
  }
}
