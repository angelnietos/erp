/**
 * Shared Storage Integration Library
 * 
 * Provides storage port (interface) and adapters for different storage providers.
 * 
 * Usage:
 * ```typescript
 * import { StoragePort, STORAGE_PORT } from '@josanz-erp/shared-integrations-storage';
 * 
 * @Injectable()
 * class MyService {
 *   constructor(@Inject(STORAGE_PORT) private storagePort: StoragePort) {}
 * }
 * ```
 */

// Ports
export { StoragePort, UploadParams, UploadResult, DownloadParams, DownloadResult, DeleteParams, GetUrlParams, STORAGE_PORT } from './lib/storage.port';

// Adapters
export { LocalStorageAdapter } from './lib/adapters/local-storage.adapter';
