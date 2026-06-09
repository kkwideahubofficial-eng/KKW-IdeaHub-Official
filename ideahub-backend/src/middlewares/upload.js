import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ideahub',
    resource_type: 'auto',
    allowed_formats: [
      'jpg', 'png', 'jpeg', 'webp', 'gif', 'avif', 'svg',
      'pdf', 'docx', 'zip', 'stl', 'step', 'dwg', 'dxf'
    ],
  },
});

export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
export default upload;


