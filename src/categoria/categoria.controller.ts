import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('categoria')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriaService.create(createCategoriaDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.categoriaService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.categoriaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    return this.categoriaService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.categoriaService.remove(id);
  }
}
