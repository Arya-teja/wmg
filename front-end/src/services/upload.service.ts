import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";

export interface UploadedImage {
  url: string;
  publicId: string;
}

export const uploadService = {
  async uploadImage(file: File): Promise<UploadedImage> {
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await api.post<UploadedImage>("/upload/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      throw new Error(getErrorMessage(err, "Gagal mengunggah gambar"));
    }
  },
};
