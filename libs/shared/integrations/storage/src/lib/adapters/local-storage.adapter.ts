import { Injectable, Logger } from '@nestjs/common';
import { StoragePort, UploadParams, UploadResult, DownloadParams, DownloadResult, DeleteParams, GetUrlParams } from './storage.port';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

/**
 * Local filesystem storage adapter.
 * Stores files in a local directory configured via STORAGE_LOCAL_PATH.
 */
@Injectable()
export class LocalStorageAdapter implements StoragePort {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly basePath: string;

  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH || './storage';
    this.ensureDirectory(this.basePath);
  }

  private ensureDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    const id = randomUUID();
    const filePath = path.join(this.basePath, params.path || '', id + '-' + params.filename);
    
    // Ensure parent directory exists
    const parentDir = path.dirname(filePath);
    this.ensureDirectory(parentDir);

    // Write file
    const buffer = Buffer.isBuffer(params.content) ? params.content : await this.streamToBuffer(params.content);
    fs.writeFileSync(filePath, buffer);

    const result: UploadResult = {
      id,
      url: `/storage/${path.basename(filePath)}`,
      path: filePath,
    };

    this.logger.log({ message: 'File uploaded to local storage', id, filename: params.filename });
    return result;
  }

  async download(params: DownloadParams): Promise<DownloadResult> {
    const filePath = this.resolvePath(params.id);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${params.id}`);
    }

    const content = fs.readFileSync(filePath);
    const contentType = this.getContentType(filePath);

    return {
      content,
      contentType,
      filename: path.basename(filePath),
    };
  }

  async delete(params: DeleteParams): Promise<void> {
    const filePath = this.resolvePath(params.id);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log({ message: 'File deleted', id: params.id });
    }
  }

  async getUrl(params: GetUrlParams): Promise<string> {
    return `/storage/${params.id}`;
  }

  private resolvePath(id: string): string {
    // If it looks like a full path, use it directly
    if (id.startsWith('/') || id.match(/^[A-Za-z]:/)) {
      return id;
    }
    // Otherwise, look in base path
    return path.join(this.basePath, id);
  }

  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
