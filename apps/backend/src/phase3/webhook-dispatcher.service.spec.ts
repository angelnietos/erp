import { signWebhookPayload } from './webhook-dispatcher.service';

describe('WebhookDispatcherService', () => {
  it('signWebhookPayload produces stable HMAC-SHA256 hex', () => {
    const secret = 'test-secret';
    const body = '{"eventType":"Demo"}';
    const sig = signWebhookPayload(secret, body);
    expect(sig).toMatch(/^[a-f0-9]{64}$/);
    expect(signWebhookPayload(secret, body)).toBe(sig);
    expect(signWebhookPayload(secret, body + 'x')).not.toBe(sig);
  });
});
