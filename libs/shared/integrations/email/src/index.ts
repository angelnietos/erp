/**
 * Shared Email Integration Library
 * 
 * Provides email port (interface) and adapters for different email providers.
 * 
 * Usage:
 * ```typescript
 * import { EmailPort, EMAIL_PORT } from '@josanz-erp/shared-integrations-email';
 * 
 * @Injectable()
 * class MyService {
 *   constructor(@Inject(EMAIL_PORT) private emailPort: EmailPort) {}
 * }
 * ```
 */

// Ports
export { EmailPort, SendEmailParams, EmailAttachment, EMAIL_PORT } from './lib/email.port';

// Adapters
export { SmtpEmailAdapter, EmailSmtpModule } from './lib/adapters/smtp-email.adapter';
export { SendGridEmailAdapter, EmailSendGridModule } from './lib/adapters/sendgrid-email.adapter';
