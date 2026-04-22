import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado');
    }

    if (!file.buffer?.length) {
      throw new BadRequestException('Archivo vacio o invalido');
    }

    const isVideo = (file.mimetype || '').startsWith('video/');
    const isImage = (file.mimetype || '').startsWith('image/');

    const resourceType = isVideo ? 'video' : (isImage ? 'image' : 'auto');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(
              new BadRequestException(
                `No se pudo subir el archivo a Cloudinary${error?.message ? `: ${error.message}` : ''}`,
              ),
            );
            return;
          }

          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}
