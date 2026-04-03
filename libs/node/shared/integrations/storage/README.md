# Shared Integrations Storage

Storage integration library providing storage port (interface) and adapters for different storage providers.

## Usage

### Inject StoragePort

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { StoragePort, STORAGE_PORT, UploadParams } from '@josanz-erp/shared-integrations-storage';

@Injectable()
class DocumentService {
  constructor(@Inject(STORAGE_PORT) private storagePort: StoragePort) {}

  async uploadDocument(file: Buffer, filename: string) {
    const result = await this.storagePort.upload({
      content: file,
      filename,
      contentType: 'application/pdf',
      path: 'documents',
    });
    return result.url;
  }
}
```

### Use Local Adapter

```typescript
import { Module } from '@nestjs/common';
import { LocalStorageAdapter } from '@josanz-erp/shared-integrations-storage';
import { STORAGE_PORT } from '@josanz-erp/shared-integrations-storage';

@Module({
  providers: [
    { provide: STORAGE_PORT, useClass: LocalStorageAdapter },
  ],
})
export class StorageModule {}
```

## API

### StoragePort

```typescript
interface StoragePort {
  upload(params: UploadParams): Promise<UploadResult>;
  download(params: DownloadParams): Promise<DownloadResult>;
  delete(params: DeleteParams): Promise<void>;
  getUrl(params: GetUrlParams): Promise<string>;
}

interface UploadParams {
  content: Buffer | NodeJS.ReadableStream;
  filename: string;
  contentType: string;
  path?: string;
  metadata?: Record<string, string>;
}

interface UploadResult {
  id: string;
  url: string;
  path: string;
}
```

## Adapters

- **LocalStorageAdapter**: Local filesystem storage
