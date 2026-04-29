import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { Roles } from 'src/auth/roles.decorator';
import { CloudinaryService } from './cloudinary.service';

type CreateSignatureDto = {
  folder?: string;
  resourceType?: 'image' | 'video';
};

@ApiTags('cloudinary')
@ApiBearerAuth('bearer')
@UseGuards(RolesGuard)
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('signature')
  @Roles(Rol.ADMIN, Rol.COACH)
  createSignature(@Body() body: CreateSignatureDto) {
    const folder = body.folder?.trim();

    if (!folder) {
      throw new BadRequestException('Debes indicar la carpeta de destino');
    }

    return this.cloudinaryService.createUploadSignature({
      folder,
      resourceType: body.resourceType || 'image',
    });
  }
}