import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PlanNutricionalService } from './plan-nutricional.service';
import { CreatePlanNutricionalDto } from './dto/create-plan-nutricional.dto';
import { UpdatePlanNutricionalDto } from './dto/update-plan-nutricional.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@ApiTags('plan-nutricional')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('plan-nutricional')
export class PlanNutricionalController {
  constructor(
    private readonly planNutricionalService: PlanNutricionalService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.COACH)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'linkPdf', maxCount: 1 }]))
  async create(
    @Body() createPlanNutricionalDto: CreatePlanNutricionalDto,
    @UploadedFiles()
    files: {
      linkPdf?: Express.Multer.File[];
    },
  ) {
    let linkPdf = createPlanNutricionalDto.linkPdf;

    if (files?.linkPdf?.[0]) {
      const uploadedFile = await this.cloudinaryService.uploadFile(
        files.linkPdf[0],
        'tauros/planes-nutricionales',
      );
      linkPdf = uploadedFile.secure_url;
    }

    return this.planNutricionalService.create({
      ...createPlanNutricionalDto,
      linkPdf,
    });
  }

  @Get('usuario/:usuarioId')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findAllByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.planNutricionalService.findAllByUsuario(usuarioId);
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  findOne(@Param('id') id: string) {
    return this.planNutricionalService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'linkPdf', maxCount: 1 }]))
  async update(
    @Param('id') id: string,
    @Body() updatePlanNutricionalDto: UpdatePlanNutricionalDto,
    @UploadedFiles()
    files: {
      linkPdf?: Express.Multer.File[];
    },
  ) {
    let linkPdf = updatePlanNutricionalDto.linkPdf;

    if (files?.linkPdf?.[0]) {
      const uploadedFile = await this.cloudinaryService.uploadFile(
        files.linkPdf[0],
        'tauros/planes-nutricionales',
      );
      linkPdf = uploadedFile.secure_url;
    }

    return this.planNutricionalService.update(id, {
      ...updatePlanNutricionalDto,
      linkPdf,
    });
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.COACH)
  remove(@Param('id') id: string) {
    return this.planNutricionalService.remove(id);
  }
}
