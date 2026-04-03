import { registerAs } from '@nestjs/config';

export interface VeriFactuConfig {
  simulationMode: boolean;
  certificatePath: string;
  certificatePassword: string;
  certificateSerial: string;
  certificateThumbprint: string;
  aeatEnvironment: 'test' | 'production';
  aeatTestUrl: string;
  aeatProductionUrl: string;
  loggingEnabled: boolean;
  skipNifAeatValidation: boolean;
  skipViesVatNumberValidation: boolean;
  maxQueueSize: number;
  waitSecondsBetweenCalls: number;
}

export default registerAs(
  'verifactu',
  (): VeriFactuConfig => ({
    // Simulation mode - skip actual AEAT submission when true
    simulationMode:
      process.env.SIMULATION_MODE === 'true' ||
      process.env.AEAT_ENVIRONMENT === 'test',

    // Certificate configuration - can use file path or Windows store
    certificatePath: process.env.CERTIFICATE_PATH || '',
    certificatePassword: process.env.CERTIFICATE_PASSWORD || '',
    certificateSerial: process.env.CERTIFICATE_SERIAL || '',
    certificateThumbprint: process.env.CERTIFICATE_THUMBPRINT || '',

    // AEAT environment configuration
    aeatEnvironment:
      (process.env.AEAT_ENVIRONMENT as 'test' | 'production') || 'test',
    aeatTestUrl:
      process.env.AEAT_TEST_URL ||
      'https://prewww2.aeat.es/wlpl/TIKE-CONT/SwFacturacionSSS',
    aeatProductionUrl:
      process.env.AEAT_PRODUCTION_URL ||
      'https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/SwFacturacionSSS',

    // Validation options
    loggingEnabled: process.env.LOGGING_ENABLED === 'true',
    skipNifAeatValidation: process.env.SKIP_NIF_AEAT_VALIDATION === 'true',
    skipViesVatNumberValidation:
      process.env.SKIP_VIES_VAT_VALIDATION === 'true',

    // Flow control
    maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE || '1000', 10),
    waitSecondsBetweenCalls: parseInt(
      process.env.WAIT_SECONDS_BETWEEN_CALLS || '60',
      10,
    ),
  }),
);
