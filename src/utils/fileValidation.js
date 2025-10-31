import storageConfig from '../config/storage.js';
import path from 'path';

/**
 * Validate file extension
 * @param {string} filename - File name
 * @returns {Object} Validation result
 */
export const validateFileExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const allowedExtensions = Object.values(storageConfig.mimeToExtension).map(e => `.${e}`);
  
  if (!ext) {
    return {
      valid: false,
      error: 'File has no extension'
    };
  }
  
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension '${ext}' is not allowed. Allowed: ${allowedExtensions.join(', ')}`
    };
  }
  
  return { valid: true };
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {Object} Validation result
 */
export const validateFileSize = (size) => {
  if (size === 0) {
    return {
      valid: false,
      error: 'File is empty'
    };
  }
  
  if (size > storageConfig.maxFileSize) {
    const maxSizeMB = storageConfig.maxFileSize / 1024 / 1024;
    const fileSizeMB = (size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }
  
  return { valid: true };
};

/**
 * Validate MIME type
 * @param {string} mimeType - File MIME type
 * @returns {Object} Validation result
 */
export const validateMimeType = (mimeType) => {
  if (!mimeType) {
    return {
      valid: false,
      error: 'MIME type is missing'
    };
  }
  
  if (!storageConfig.allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `MIME type '${mimeType}' is not allowed. Allowed: ${storageConfig.allowedMimeTypes.join(', ')}`
    };
  }
  
  return { valid: true };
};

/**
 * Sanitize filename
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  
  // Remove special characters, keep only alphanumeric, hyphens, and underscores
  const sanitized = basename
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 100); // Limit length
  
  return `${sanitized}${ext}`.toLowerCase();
};

/**
 * Get file extension from MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} File extension
 */
export const getExtensionFromMimeType = (mimeType) => {
  return storageConfig.mimeToExtension[mimeType] || '';
};

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

/**
 * Validate complete file object
 * @param {Object} file - File object
 * @returns {Object} Validation result with all errors
 */
export const validateFile = (file) => {
  const errors = [];
  
  // Validate filename
  if (!file.originalname) {
    errors.push('Filename is missing');
  } else {
    const extValidation = validateFileExtension(file.originalname);
    if (!extValidation.valid) {
      errors.push(extValidation.error);
    }
  }
  
  // Validate size
  if (file.size !== undefined) {
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
      errors.push(sizeValidation.error);
    }
  } else {
    errors.push('File size is missing');
  }
  
  // Validate MIME type
  if (file.mimetype) {
    const mimeValidation = validateMimeType(file.mimetype);
    if (!mimeValidation.valid) {
      errors.push(mimeValidation.error);
    }
  } else {
    errors.push('MIME type is missing');
  }
  
  // Validate buffer
  if (!file.buffer || file.buffer.length === 0) {
    errors.push('File buffer is empty');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Check if file is an image
 * @param {string} mimeType - File MIME type
 * @returns {boolean} True if file is an image
 */
export const isImage = (mimeType) => {
  return mimeType && mimeType.startsWith('image/');
};

/**
 * Check if file is a PDF
 * @param {string} mimeType - File MIME type
 * @returns {boolean} True if file is a PDF
 */
export const isPDF = (mimeType) => {
  return mimeType === 'application/pdf';
};

/**
 * Generate safe filename with timestamp
 * @param {string} originalName - Original filename
 * @returns {string} Safe filename with timestamp
 */
export const generateSafeFilename = (originalName) => {
  const ext = path.extname(originalName);
  const basename = path.basename(originalName, ext);
  const sanitized = sanitizeFilename(basename);
  const timestamp = Date.now();
  
  return `${timestamp}-${sanitized}${ext}`;
};

export default {
  validateFileExtension,
  validateFileSize,
  validateMimeType,
  validateFile,
  sanitizeFilename,
  getExtensionFromMimeType,
  formatFileSize,
  isImage,
  isPDF,
  generateSafeFilename
};
