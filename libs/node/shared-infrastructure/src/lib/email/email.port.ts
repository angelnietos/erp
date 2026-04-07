/**
 * Port (interface) for the email service.
 * The domain calls this contract only — it never knows how the email is sent.
 * MVP: SmtpEmailAdapter implements it.
 * Future: MsGraphEmailAdapter can be swapped in with zero domain changes.
 */
export interface EmailPort {
  send(params: SendEmailParams): Promise<void>;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  /** Optional reference — used to log in email_logs table */
  referenceId?: string;
  referenceType?: string;
}

export const EMAIL_PORT = Symbol('EMAIL_PORT');
