import { S3Client } from '@aws-sdk/client-s3';
import config from './index.js';

const storageConfig = {
  maxFileSize: config.storage.maxFileSize,
  presignedUrlExpiry: config.storage.presignedUrlExpiry,
  endpoint: config.storage.endpoint,
  publicEndpoint: config.storage.publicEndpoint,
  port: config.storage.port,
  accessKey: config.storage.accessKey,
  secretKey: config.storage.secretKey,
  bucketName: config.storage.bucketName,
  useSSL: config.storage.useSSL,
  
  // Allowed MIME types
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    'image/tiff'
  ],
  
  // File extensions mapping
  mimeToExtension: {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/tiff': 'tiff'
  }
};

// Create S3 Client for MinIO (S3-compatible)
const s3Client = new S3Client({
  endpoint: `http${storageConfig.useSSL ? 's' : ''}://${storageConfig.endpoint}:${storageConfig.port}`,
  region: 'us-east-1', // MinIO requires a region 
  credentials: {
    accessKeyId: storageConfig.accessKey,
    secretAccessKey: storageConfig.secretKey
  },
  forcePathStyle: true // Required for MinIO
});

// Create S3 Client for presigned URLs - uses public endpoint
const s3ClientPublic = new S3Client({
  endpoint: `http${storageConfig.useSSL ? 's' : ''}://${storageConfig.publicEndpoint}:${storageConfig.port}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: storageConfig.accessKey,
    secretAccessKey: storageConfig.secretKey
  },
  forcePathStyle: true
});

// Get bucket name
const getBucketName = () => {
  return storageConfig.bucketName;
};

export { s3Client, s3ClientPublic, storageConfig, getBucketName };
export default storageConfig;
