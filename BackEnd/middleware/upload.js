import path from 'path';
import fs from 'fs';
import { ENV_VARS } from '../config/envVars.js';
import multer from 'multer';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// Ensure upload directory exists
const uploadDir = ENV_VARS.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'images';

    const fullPath = path.join(uploadDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    // cb is a callback function that is used to save the file to the destination directory
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
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
  // Only allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Only images are supported.`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(ENV_VARS.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// Error handling wrapper
const handleUpload = (uploadFunction) => {
  return async (req, res, next) => {
    uploadFunction(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB.'
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

      // Process uploaded file and upload to Cloudinary
      req.uploadedFiles = [];

      // Handle single file upload
      if (req.file) {
        try {
          // Upload to Cloudinary immediately
          const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

          if (cloudinaryResponse) {
            // Store Cloudinary data
            req.uploadedFiles.push({
              filename: cloudinaryResponse.public_id,
              originalName: req.file.originalname,
              url: cloudinaryResponse.secure_url,
              mimetype: req.file.mimetype,
              size: req.file.size,
              cloudinaryId: cloudinaryResponse.public_id
            });

            // Clean up local file after successful Cloudinary upload
            try {
              if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
                console.log(`Local file cleaned up: ${req.file.path}`);
              }
            } catch (cleanupError) {
              console.error(`Error cleaning up local file: ${cleanupError.message}`);
            }
          } else {
            // Fallback to local file if Cloudinary upload fails
            req.uploadedFiles.push({
              filename: req.file.filename,
              originalName: req.file.originalname,
              path: req.file.path,
              mimetype: req.file.mimetype,
              size: req.file.size
            });
          }
        } catch (error) {
          console.error('Error processing file upload:', error);
          // Fallback to local file on error
          req.uploadedFiles.push({
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size
          });
        }
      }

      next();
    });
  };
};

export const uploadSingle = handleUpload(upload.single('attachments'));
export const uploadAvatar = handleUpload(upload.single('file'));
 