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
  Res,
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
      linkPdf = uploadedFile;
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

  @Get(':id/preview')
  @Roles(Rol.ADMIN, Rol.COACH, Rol.USER)
  async getPreview(@Param('id') id: string, @Res() res: any) {
    try {
      const plan = await this.planNutricionalService.findOne(id);

      const pdfUrl = plan?.downloadUrl || plan?.previewUrl;
      if (!pdfUrl) {
        return res.status(404).json({ error: 'Plan no encontrado' });
      }

      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Cloudinary returned ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=plan-nutricional.pdf',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      });
      
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error('Error fetching PDF preview:', error);
      res.status(500).json({ error: 'No se pudo cargar el PDF' });
    }
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
      linkPdf = uploadedFile;
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
