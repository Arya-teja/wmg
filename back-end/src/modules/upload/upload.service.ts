import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinaryConfig: any) {}

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'wmg-products' },
        (error, result) => {
          if (error || !result) {
            console.error('Error dari Cloudinary:', error);
            return reject(error);
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      // Log tapi jangan throw — kalau gagal hapus di Cloudinary,
      // proses update produk di DB tetap harus lanjut
      console.error(
        `Gagal hapus image Cloudinary (publicId: ${publicId}):`,
        error,
      );
    }
  }
}
