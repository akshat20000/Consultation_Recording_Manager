import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError';

const UPLOAD_DIR = './uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const extOk = ext && allowedExtensions.includes(ext);
  const mimeOk = mime.startsWith('audio/');


  if (extOk || mimeOk) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Unsupported file format: ${ext} & mime=${mime}. Supported formats are mp3, wav, m4a, ogg, webm.`) as any);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max limit
  },
});
