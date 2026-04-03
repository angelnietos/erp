# Auth API Key

API key authentication library providing guard for API key validation.

## Usage

### Basic Usage

```typescript
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '@josanz-erp/auth-api-key';

@Controller('external')
@UseGuards(ApiKeyGuard)
export class ExternalController {
  @Get('data')
  getData() {
    return { data: 'external data' };
  }
}
```

### Custom Configuration

```typescript
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '@josanz-erp/auth-api-key';

@UseGuards(new ApiKeyGuard({
  headerName: 'x-api-key',
  required: true,
  requiredScope: 'read:data',
}))
@Controller('external')
export class ExternalController {}
```

### Custom Validator

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiKeyGuard, ApiKeyValidator } from '@josanz-erp/auth-api-key';

@Injectable()
class DatabaseApiKeyValidator implements ApiKeyValidator {
  async validateKey(apiKey: string, tenantId?: string): Promise<boolean> {
    // Custom validation logic
    const key = await this.db.findApiKey(apiKey, tenantId);
    return !!key;
  }
}

@UseGuards(new ApiKeyGuard({
  validator: new DatabaseApiKeyValidator(),
}))
@Controller('external')
export class ExternalController {}
```

## API

### Guards

- **ApiKeyGuard**: Validates API keys from request headers

### Options

```typescript
interface ApiKeyGuardOptions {
  headerName?: string;       // Header name (default: x-api-key)
  required?: boolean;       // Whether required (default: true)
  requiredScope?: string;   // Optional required scope
  validator?: ApiKeyValidator; // Custom validator
}
```

### Utils

- **hashApiKey**: Hash API key for secure storage using SHA-256
