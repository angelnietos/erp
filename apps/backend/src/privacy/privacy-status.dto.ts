export interface PrivacySecurityStatusDto {
  encryptionAtRest: boolean;
  piiRedactionEnabled: boolean;
  auditInterceptorEnabled: boolean;
  auditRetentionDays: number;
  domainEventsRetentionDays: number;
  policyVersion: string;
}
