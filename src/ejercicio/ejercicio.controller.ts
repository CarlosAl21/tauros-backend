import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EjercicioService } from './ejercicio.service';
import { CreateEjercicioDto } from './dto/create-ejercicio.dto';
import { UpdateEjercicioDto } from './dto/update-ejercicio.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('ejercicio')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('ejercicio')
export class EjercicioController {
  constructor(private readonly ejercicioService: EjercicioService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'linkVideo', maxCount: 1 },
      { name: 'linkAM', maxCount: 1 },
    ]),
  )
  create(
    @Body() createEjercicioDto: CreateEjercicioDto,
    @UploadedFiles()
    files: {
      linkVideo?: Express.Multer.File[];
      linkAM?: Express.Multer.File[];
    },
  ) {
    return this.ejercicioService.create(createEjercicioDto, files);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.ejercicioService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.ejercicioService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'linkVideo', maxCount: 1 },
      { name: 'linkAM', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() updateEjercicioDto: UpdateEjercicioDto,
    @UploadedFiles()
    files: {
      linkVideo?: Express.Multer.File[];
      linkAM?: Express.Multer.File[];
    },
  ) {
    return this.ejercicioService.update(id, updateEjercicioDto, files);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.ejercicioService.remove(id);
  }
}
