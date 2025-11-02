import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, s3ClientPublic, storageConfig, getBucketName } from '../config/storage.js';
import logger from '../config/logger.js';
import crypto from 'crypto';
import path from 'path';

class StorageService {
  constructor() {
    this.s3Client = s3Client;
    this.s3ClientPublic = s3ClientPublic;
    this.bucketName = getBucketName();
    this.config = storageConfig;
  }

  /**
   * Initialize storage - create bucket if it doesn't exist
   */
  async initialize() {
    try {
      // Check if bucket exists
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      logger.info(`Storage bucket '${this.bucketName}' is ready`);
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        // Bucket doesn't exist, create it
        try {
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
          logger.info(`Created storage bucket '${this.bucketName}'`);
        } catch (createError) {
          logger.error(`Failed to create bucket '${this.bucketName}':`, createError);
          throw createError;
        }
      } else {
        logger.error(`Error checking bucket '${this.bucketName}':`, error);
        throw error;
      }
    }
  }

  /**
   * Generate a unique file key
   * @param {string} originalName - Original filename
   * @param {string} category - Document category
   * @returns {string} Unique file key
   */
  generateFileKey(originalName, category = 'general') {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    const sanitizedName = path.basename(originalName, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    
    return `${category}/${timestamp}-${randomString}-${sanitizedName}${ext}`;
  }

  /**
   * Upload a file to storage
   * @param {Buffer} buffer - File buffer
   * @param {string} key - File key/path
   * @param {string} mimeType - File MIME type
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(buffer, key, mimeType, metadata = {}) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        Metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString()
        }
      });

      const result = await this.s3Client.send(command);
      
      logger.info(`File uploaded successfully: ${key}`);
      
      return {
        success: true,
        key,
        bucket: this.bucketName,
        size: buffer.length,
        etag: result.ETag
      };
    } catch (error) {
      logger.error(`Failed to upload file ${key}:`, error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Generate a presigned URL for file download
   * @param {string} key - File key
   * @param {number} expiresIn - URL expiry time in seconds
   * @returns {Promise<string>} Presigned URL
   */
  async getPresignedUrl(key, expiresIn = null) {
    try {
      const expiry = expiresIn || this.config.presignedUrlExpiry;
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      // Use public client for presigned URLs so they work in browsers
      const url = await getSignedUrl(this.s3ClientPublic, command, { expiresIn: expiry });
      
      logger.info(`Generated presigned URL for ${key} (expires in ${expiry}s)`);
      
      return url;
    } catch (error) {
      logger.error(`Failed to generate presigned URL for ${key}:`, error);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Delete a file from storage
   * @param {string} key - File key
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.s3Client.send(command);
      
      logger.info(`File deleted successfully: ${key}`);
      
      return {
        success: true,
        key,
        message: 'File deleted successfully'
      };
    } catch (error) {
      logger.error(`Failed to delete file ${key}:`, error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   * @param {string} key - File key
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(key) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const response = await this.s3Client.send(command);
      
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
        etag: response.ETag
      };
    } catch (error) {
      logger.error(`Failed to get metadata for ${key}:`, error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * @param {string} key - File key
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(key) {
    try {
      await this.getFileMetadata(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate file before upload
   * @param {Object} file - File object from multer
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > this.config.maxFileSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.config.maxFileSize / 1024 / 1024}MB`);
    }

    // Check MIME type
    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type '${file.mimetype}' is not allowed`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate presigned URL from file URL/key
   * @param {string} fileUrl - File URL or key
   * @param {number} expiresIn - Expiration time in seconds
   * @returns {Promise<string>} Presigned URL
   */
  async generatePresignedUrl(fileUrl, expiresIn = 3600) {
    try {
      // Extract key from URL if it's a full URL
      const key = fileUrl.includes('://') ? fileUrl.split('/').slice(3).join('/') : fileUrl;
      return await this.getPresignedUrl(key, expiresIn);
    } catch (error) {
      logger.error('Failed to generate presigned URL:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Delete file by URL
   * @param {string} fileUrl - File URL or key
   * @returns {Promise<Object>} Delete result
   */
  async deleteFileByUrl(fileUrl) {
    try {
      // Extract key from URL if it's a full URL
      const key = fileUrl.includes('://') ? fileUrl.split('/').slice(3).join('/') : fileUrl;
      return await this.deleteFile(key);
    } catch (error) {
      logger.error('Failed to delete file by URL:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Upload a file from multer (high-level wrapper)
   * @param {Object} file - Multer file object
   * @param {string} category - File category/folder
   * @returns {Promise<Object>} Upload result with file details
   */
  async uploadMulterFile(file, category = 'general') {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Generate unique key
      const key = this.generateFileKey(file.originalname, category);

      // Upload file buffer
      const uploadResult = await this.uploadFile(
        file.buffer,
        key,
        file.mimetype,
        {
          originalName: file.originalname,
          size: file.size.toString()
        }
      );

      // Return file details
      return {
        fileName: path.basename(key),
        fileUrl: key,
        fileSize: file.size,
        mimeType: file.mimetype,
        key: key,
        bucket: uploadResult.bucket,
        etag: uploadResult.etag
      };
    } catch (error) {
      logger.error('Failed to upload multer file:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }
}

// Export singleton instance
const storageService = new StorageService();
export default storageService;
