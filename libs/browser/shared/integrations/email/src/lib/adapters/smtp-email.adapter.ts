import { Injectable, Logger } from '@nestjs/common';
import { EmailPort, SendEmailParams } from '../email.port';

/**
 * SMTP Email Adapter implementation.
 * Uses nodemailer-style configuration.
 */
@Injectable()
export class SmtpEmailAdapter implements EmailPort {
  private readonly logger = new Logger(SmtpEmailAdapter.name);

  async send(params: SendEmailParams): Promise<void> {
    // TODO: Implement actual SMTP sending
    // This is a placeholder that logs the email
    this.logger.log({
      message: 'Sending email via SMTP',
      to: params.to,
      subject: params.subject,
      referenceId: params.referenceId,
    });

    // In production, use nodemailer or similar:
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ ... });
  }
}

/**
 * Module for SMTP email adapter.
 */
@Injectable()
export class EmailSmtpModule {}
