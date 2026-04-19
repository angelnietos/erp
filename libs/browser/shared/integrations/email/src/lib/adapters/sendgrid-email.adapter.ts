import { Injectable, Logger } from '@nestjs/common';
import { EmailPort, SendEmailParams } from '../email.port';

/**
 * SendGrid Email Adapter implementation.
 * Requires SENDGRID_API_KEY environment variable.
 */
@Injectable()
export class SendGridEmailAdapter implements EmailPort {
  private readonly logger = new Logger(SendGridEmailAdapter.name);

  async send(params: SendEmailParams): Promise<void> {
    // TODO: Implement actual SendGrid API call
    // This is a placeholder that logs the email
    this.logger.log({
      message: 'Sending email via SendGrid',
      to: params.to,
      subject: params.subject,
      referenceId: params.referenceId,
    });

    // In production, use @sendgrid/mail:
    // import * as sgMail from '@sendgrid/mail';
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ ... });
  }
}

/**
 * Module for SendGrid email adapter.
 */
@Injectable()
export class EmailSendGridModule {}
