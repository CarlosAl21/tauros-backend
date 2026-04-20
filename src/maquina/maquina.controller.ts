import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MaquinaService } from './maquina.service';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('maquina')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('maquina')
export class MaquinaController {
  constructor(private readonly maquinaService: MaquinaService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  @UseInterceptors(FileInterceptor('linkFoto'))
  create(
    @Body() createMaquinaDto: CreateMaquinaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.maquinaService.create(createMaquinaDto, file);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAll() {
    return this.maquinaService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.maquinaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  @UseInterceptors(FileInterceptor('linkFoto'))
  update(
    @Param('id') id: string,
    @Body() updateMaquinaDto: UpdateMaquinaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.maquinaService.update(id, updateMaquinaDto, file);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.maquinaService.remove(id);
  }
}
