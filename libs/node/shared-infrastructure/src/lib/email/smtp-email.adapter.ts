import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { EmailPort, SendEmailParams } from './email.port';

@Injectable()
export class SmtpEmailAdapter implements EmailPort {
  private readonly logger = new Logger(SmtpEmailAdapter.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (!host) {
      return;
    }
    const port = parseInt(this.config.get<string>('SMTP_PORT') ?? '587', 10);
    const secure = this.config.get<string>('SMTP_SECURE') === 'true' || port === 465;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
    this.logger.log(`SMTP email → ${host}:${port}`);
  }

  async send(params: SendEmailParams): Promise<void> {
    if (!this.transporter) {
      throw new Error('SMTP not configured');
    }
    const from =
      this.config.get<string>('SMTP_FROM')?.trim() ||
      this.config.get<string>('SMTP_USER') ||
      'noreply@babooni.local';
    await this.transporter.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  }
}
