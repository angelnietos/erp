import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMAIL_PORT } from './email.port';
import { ConsoleEmailAdapter } from './console-email.adapter';
import { SmtpEmailAdapter } from './smtp-email.adapter';

export function provideEmailPort(): Provider {
  return {
    provide: EMAIL_PORT,
    useFactory: (config: ConfigService, consoleAdapter: ConsoleEmailAdapter) => {
      const host = config.get<string>('SMTP_HOST')?.trim();
      if (host) {
        return new SmtpEmailAdapter(config);
      }
      return consoleAdapter;
    },
    inject: [ConfigService, ConsoleEmailAdapter],
  };
}
