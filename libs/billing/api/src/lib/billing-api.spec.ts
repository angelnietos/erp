import { billingApi } from './billing-api';

describe('billingApi', () => {
  it('should work', () => {
    expect(billingApi()).toEqual('billing-api');
  });
});
