import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MaquinaService } from './maquina.service';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('maquina')
export class MaquinaController {
  constructor(private readonly maquinaService: MaquinaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('linkFoto'))
  create(
    @Body() createMaquinaDto: CreateMaquinaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.maquinaService.create(createMaquinaDto, file);
  }

  @Get()
  findAll() {
    return this.maquinaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maquinaService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('linkFoto'))
  update(
    @Param('id') id: string,
    @Body() updateMaquinaDto: UpdateMaquinaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.maquinaService.update(id, updateMaquinaDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maquinaService.remove(id);
  }
}
