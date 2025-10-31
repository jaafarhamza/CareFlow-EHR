import multer from 'multer';
import storageConfig from '../config/storage.js';
import logger from '../config/logger.js';

/**
 * Configure multer for file uploads
 * Using memory storage to get buffer for S3/MinIO upload
 */
const storage = multer.memoryStorage();

/**
 * File filter to validate MIME types
 */
const fileFilter = (req, file, cb) => {
  if (storageConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' is not allowed. Allowed types: ${storageConfig.allowedMimeTypes.join(', ')}`), false);
  }
};

/**
 * Multer configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: storageConfig.maxFileSize,
    files: 1 // Single file upload by default
  }
});

/**
 * Middleware for single file upload
 * @param {string} fieldName - Form field name
 */
export const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds maximum allowed size of ${storageConfig.maxFileSize / 1024 / 1024}MB`
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: `Unexpected field name. Expected '${fieldName}'`
          });
        }
        
        logger.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        // Other errors (e.g., file filter rejection)
        logger.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // No file uploaded (optional upload)
      if (!req.file) {
        return next();
      }
      
      // Validate file
      if (req.file.size === 0) {
        return res.status(400).json({
          success: false,
          message: 'Uploaded file is empty'
        });
      }
      
      logger.info(`File uploaded to memory: ${req.file.originalname} (${req.file.size} bytes)`);
      next();
    });
  };
};

/**
 * Middleware for multiple file uploads
 * @param {string} fieldName - Form field name
 * @param {number} maxCount - Maximum number of files
 */
export const uploadMultiple = (fieldName = 'files', maxCount = 5) => {
  return (req, res, next) => {
    const uploadHandler = upload.array(fieldName, maxCount);
    
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds maximum allowed size of ${storageConfig.maxFileSize / 1024 / 1024}MB`
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum ${maxCount} files allowed`
          });
        }
        
        logger.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        logger.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // No files uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      // Validate all files
      for (const file of req.files) {
        if (file.size === 0) {
          return res.status(400).json({
            success: false,
            message: `File '${file.originalname}' is empty`
          });
        }
      }
      
      logger.info(`${req.files.length} files uploaded to memory`);
      next();
    });
  };
};

/**
 * Middleware to require file upload
 */
export const requireFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File is required'
    });
  }
  next();
};

/**
 * Middleware to validate file MIME type against magic bytes
 * This provides additional security beyond extension checking
 */
export const validateFileMagicBytes = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Import file-type dynamically (ESM module)
    const { fileTypeFromBuffer } = await import('file-type');
    const detectedType = await fileTypeFromBuffer(req.file.buffer);
    
    if (!detectedType) {
      // Some valid files (like SVG) might not be detected
      if (req.file.mimetype === 'image/svg+xml') {
        return next();
      }
      
      return res.status(400).json({
        success: false,
        message: 'Could not determine file type'
      });
    }
    
    // Check if detected MIME type matches uploaded MIME type
    if (detectedType.mime !== req.file.mimetype) {
      logger.warn(`MIME type mismatch: uploaded=${req.file.mimetype}, detected=${detectedType.mime}`);
      
      // Update to detected type if it's allowed
      if (storageConfig.allowedMimeTypes.includes(detectedType.mime)) {
        req.file.mimetype = detectedType.mime;
        logger.info(`Updated MIME type to detected type: ${detectedType.mime}`);
      } else {
        return res.status(400).json({
          success: false,
          message: `File type mismatch. Detected type '${detectedType.mime}' is not allowed`
        });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Error validating file magic bytes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating file type'
    });
  }
};

export default {
  uploadSingle,
  uploadMultiple,
  requireFile,
  validateFileMagicBytes
};
