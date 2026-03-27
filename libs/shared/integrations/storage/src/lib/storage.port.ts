/**
 * Port (interface) for the storage service.
 * The domain calls this contract only — it never knows how the file is stored.
 * 
 * Usage:
 * - Inject STORAGE_PORT in your domain services
 * - Implement with LocalStorageAdapter or S3StorageAdapter
 */
export interface StoragePort {
  upload(params: UploadParams): Promise<UploadResult>;
  download(params: DownloadParams): Promise<DownloadResult>;
  delete(params: DeleteParams): Promise<void>;
  getUrl(params: GetUrlParams): Promise<string>;
}

export interface UploadParams {
  /** File buffer or stream */
  content: Buffer | NodeJS.ReadableStream;
  /** Original filename */
  filename: string;
  /** MIME type */
  contentType: string;
  /** Optional path within the bucket */
  path?: string;
  /** Optional metadata */
  metadata?: Record<string, string>;
}

export interface UploadResult {
  /** Unique identifier for the uploaded file */
  id: string;
  /** Full URL to access the file */
  url: string;
  /** Path within storage */
  path: string;
}

export interface DownloadParams {
  /** File ID or path */
  id: string;
}

export interface DownloadResult {
  /** File content */
  content: Buffer;
  /** MIME type */
  contentType: string;
  /** Original filename */
  filename: string;
}

export interface DeleteParams {
  /** File ID or path */
  id: string;
}

export interface GetUrlParams {
  /** File ID or path */
  id: string;
  /** Optional expiration in seconds */
  expiresIn?: number;
}

/** Token to inject the StoragePort */
export const STORAGE_PORT = Symbol('STORAGE_PORT');
