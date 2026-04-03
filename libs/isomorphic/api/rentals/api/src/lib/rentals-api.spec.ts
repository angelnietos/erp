import { rentalsApi } from './rentals-api';

describe('rentalsApi', () => {
  it('should work', () => {
    expect(rentalsApi()).toEqual('rentals-api');
  });
});
