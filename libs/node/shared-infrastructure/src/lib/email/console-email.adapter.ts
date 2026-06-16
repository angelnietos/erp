import { Injectable, Logger } from '@nestjs/common';
import { EmailPort, SendEmailParams } from './email.port';

/** Desarrollo / MVP: imprime emails en consola del backend. */
@Injectable()
export class ConsoleEmailAdapter implements EmailPort {
  private readonly logger = new Logger(ConsoleEmailAdapter.name);

  async send(params: SendEmailParams): Promise<void> {
    this.logger.log(
      `[EMAIL] → ${params.to}\n  Subject: ${params.subject}\n  Body: ${params.html.replace(/\s+/g, ' ').trim()}`,
    );
  }
}
