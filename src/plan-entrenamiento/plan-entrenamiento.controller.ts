import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PlanEntrenamientoService } from './plan-entrenamiento.service';
import { CreatePlanEntrenamientoDto } from './dto/create-plan-entrenamiento.dto';
import { UpdatePlanEntrenamientoDto } from './dto/update-plan-entrenamiento.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('plan-entrenamiento')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('plan-entrenamiento')
export class PlanEntrenamientoController {
  constructor(private readonly planEntrenamientoService: PlanEntrenamientoService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  create(@Body() createPlanEntrenamientoDto: CreatePlanEntrenamientoDto) {
    return this.planEntrenamientoService.create(createPlanEntrenamientoDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.planEntrenamientoService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.planEntrenamientoService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updatePlanEntrenamientoDto: UpdatePlanEntrenamientoDto) {
    return this.planEntrenamientoService.update(id, updatePlanEntrenamientoDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.planEntrenamientoService.remove(id);
  }

  @Post('asignar-plan')
  @Roles(Rol.ADMIN, Rol.COACH)
  asignarPlan(@Body() asignarPlanDto: { planEntrenamientoId: string, usuarioId: string }) {
    return this.planEntrenamientoService.asignarPlan(asignarPlanDto.planEntrenamientoId, asignarPlanDto.usuarioId);
  }

}
