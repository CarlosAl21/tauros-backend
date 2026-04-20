import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { EjercicioService } from './ejercicio.service';
import { CreateEjercicioDto } from './dto/create-ejercicio.dto';
import { UpdateEjercicioDto } from './dto/update-ejercicio.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('ejercicio')
export class EjercicioController {
  constructor(private readonly ejercicioService: EjercicioService) {}

  @Post()
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
  findAll() {
    return this.ejercicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ejercicioService.findOne(id);
  }

  @Patch(':id')
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
  remove(@Param('id') id: string) {
    return this.ejercicioService.remove(id);
  }
}
