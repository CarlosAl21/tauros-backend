import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { createHash } from 'crypto';

type CloudinaryUploadSignatureOptions = {
  folder: string;
  resourceType: 'image' | 'video';
};

type CloudinaryUploadSignatureResponse = {
  cloudName: string;
  apiKey: string;
  folder: string;
  resourceType: 'image' | 'video';
  timestamp: number;
  signature: string;
  uploadUrl: string;
};

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

  buildPrivateDownloadUrl(fileUrl: string, attachment = false): string {
    const parsedUrl = this.parseCloudinaryUrl(fileUrl);
    if (!parsedUrl) {
      return fileUrl;
    }

    const { publicId, format, version } = parsedUrl;

    return cloudinary.utils.url(publicId, {
      resource_type: 'raw',
      type: 'authenticated',
      secure: true,
      sign_url: true,
      version,
      format,
    });
  }

  createUploadSignature(options: CloudinaryUploadSignatureOptions): CloudinaryUploadSignatureResponse {
    const timestamp = Math.floor(Date.now() / 1000);
    const cloudName = this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.getOrThrow<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET');
    const signaturePayload = this.buildSignaturePayload({
      folder: options.folder,
      timestamp,
    });

    const signature = createHash('sha1')
      .update(`${signaturePayload}${apiSecret}`)
      .digest('hex');

    return {
      cloudName,
      apiKey,
      folder: options.folder,
      resourceType: options.resourceType,
      timestamp,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${options.resourceType}/upload`,
    };
  }

  private buildSignaturePayload(values: Record<string, string | number>) {
    return Object.entries(values)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }

  private parseCloudinaryUrl(fileUrl: string) {
    try {
      const parsed = new URL(fileUrl);
      if (!parsed.hostname.includes('cloudinary.com') || !parsed.pathname.includes('/upload/')) {
        return null;
      }

      const uploadPath = parsed.pathname.split('/upload/')[1];
      if (!uploadPath) {
        return null;
      }

      const pathParts = decodeURIComponent(uploadPath).split('/').filter(Boolean);
      if (!pathParts.length) {
        return null;
      }

      let version = undefined;
      if (/^v\d+$/.test(pathParts[0])) {
        version = Number(pathParts.shift()?.slice(1));
      }

      const filename = pathParts.pop();
      if (!filename) {
        return null;
      }

      const formatMatch = filename.match(/\.([^.]+)$/);
      const format = formatMatch?.[1] || 'pdf';
      const publicId = [...pathParts, filename.replace(/\.[^.]+$/, '')].join('/');

      if (!publicId) {
        return null;
      }

      return { publicId, format, version };
    } catch (_error) {
      return null;
    }
  }
}
