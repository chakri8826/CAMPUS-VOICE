import path from 'path';
import fs from 'fs';
import { ENV_VARS } from '../config/envVars.js';
import multer from 'multer';

// Ensure upload directory exists
const uploadDir = ENV_VARS.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    let subDir = 'general';
    
    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype.startsWith('video/')) {
      subDir = 'videos';
    } else if (file.mimetype.startsWith('audio/')) {
      subDir = 'audio';
    } else if (file.mimetype.includes('pdf')) {
      subDir = 'documents';
    }
    
    const fullPath = path.join(uploadDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitize filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(ENV_VARS.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files per request
  }
});

// Error handling wrapper
const handleUpload = (uploadFunction) => {
  return (req, res, next) => {
    uploadFunction(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB.'
            });
          case 'LIMIT_FILE_COUNT':
            return res.status(400).json({
              success: false,
              message: 'Too many files. Maximum is 5 files.'
            });
          case 'LIMIT_UNEXPECTED_FILE':
            return res.status(400).json({
              success: false,
              message: 'Unexpected file field.'
            });
          default:
            return res.status(400).json({
              success: false,
              message: 'File upload error.'
            });
        }
      } else if (err) {
        // Other errors
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Process uploaded files
      req.uploadedFiles = [];
      
      // Handle single file upload (upload.single)
      if (req.file) {
        req.uploadedFiles.push({
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
      }
      // Handle multiple files upload (upload.array or upload.fields)
      else if (req.files) {
        // Handle multiple files
        if (Array.isArray(req.files)) {
          req.files.forEach(file => {
            req.uploadedFiles.push({
              filename: file.filename,
              originalName: file.originalname,
              path: file.path,
              mimetype: file.mimetype,
              size: file.size
            });
          });
        } else {
          // Handle single file from fields
          req.uploadedFiles.push({
            filename: req.files.filename,
            originalName: req.files.originalname,
            path: req.files.path,
            mimetype: req.files.mimetype,
            size: req.files.size
          });
        }
      }
      
      next();
    });
  };
};

// Delete file utility
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file URL
const getFileUrl = (filePath, req) => {
  if (!filePath) return null;
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const relativePath = filePath.replace(/\\/g, '/').replace('./uploads', '');
  return `${baseUrl}/uploads${relativePath}`;
};

export const uploadSingle = handleUpload(upload.single('file'));
export const uploadMultiple = handleUpload(upload.array('attachments', 5));
export const uploadFields = handleUpload(upload.fields([
  { name: 'images', maxCount: 3 },
  { name: 'documents', maxCount: 2 },
  { name: 'videos', maxCount: 1 }
]));
export { deleteFile, getFileUrl, upload }; 