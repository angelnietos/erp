import { documentGeneratorBackend } from './document-generator-backend';

describe('documentGeneratorBackend', () => {
  it('exposes the backend extension point', () => {
    expect(documentGeneratorBackend()).toBe('document-generator-backend');
  });
});
