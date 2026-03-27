/**
 * Port (interface) for the email service.
 * The domain calls this contract only — it never knows how the email is sent.
 * 
 * Usage:
 * - Inject EMAIL_PORT in your domain services
 * - Implement with SmtpEmailAdapter or SendGridEmailAdapter
 */
export interface EmailPort {
  send(params: SendEmailParams): Promise<void>;
}

export interface SendEmailParams {
  /** Recipient email address */
  to: string;
  /** Email subject line */
  subject: string;
  /** HTML body content */
  html: string;
  /** Optional plain text alternative */
  text?: string;
  /** Optional sender name */
  fromName?: string;
  /** Optional sender email (defaults to config) */
  from?: string;
  /** Optional reference for logging */
  referenceId?: string;
  /** Optional reference type for logging */
  referenceType?: string;
  /** Optional attachments */
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
  encoding?: string;
}

/** Token to inject the EmailPort */
export const EMAIL_PORT = Symbol('EMAIL_PORT');
