# Shared Integrations Email

Email integration library providing email port (interface) and adapters for different email providers.

## Usage

### Inject EmailPort

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { EmailPort, EMAIL_PORT, SendEmailParams } from '@josanz-erp/shared-integrations-email';

@Injectable()
class MyService {
  constructor(@Inject(EMAIL_PORT) private emailPort: EmailPort) {}

  async sendWelcomeEmail(to: string, name: string) {
    await this.emailPort.send({
      to,
      subject: 'Welcome!',
      html: `<h1>Hello ${name}</h1>`,
      referenceId: 'welcome-email',
      referenceType: 'user-registration',
    });
  }
}
```

### Use SMTP Adapter

```typescript
import { Module } from '@nestjs/common';
import { SmtpEmailAdapter } from '@josanz-erp/shared-integrations-email';
import { EMAIL_PORT } from '@josanz-erp/shared-integrations-email';

@Module({
  providers: [
    { provide: EMAIL_PORT, useClass: SmtpEmailAdapter },
  ],
})
export class EmailModule {}
```

### Use SendGrid Adapter

```typescript
import { Module } from '@nestjs/common';
import { SendGridEmailAdapter } from '@josanz-erp/shared-integrations-email';
import { EMAIL_PORT } from '@josanz-erp/shared-integrations-email';

@Module({
  providers: [
    { provide: EMAIL_PORT, useClass: SendGridEmailAdapter },
  ],
})
export class EmailModule {}
```

## API

### EmailPort

```typescript
interface EmailPort {
  send(params: SendEmailParams): Promise<void>;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  from?: string;
  referenceId?: string;
  referenceType?: string;
  attachments?: EmailAttachment[];
}
```

## Adapters

- **SmtpEmailAdapter**: SMTP-based email sending
- **SendGridEmailAdapter**: SendGrid API integration
