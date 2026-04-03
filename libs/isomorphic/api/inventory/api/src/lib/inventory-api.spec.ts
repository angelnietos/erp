import { inventoryApi } from './inventory-api';

describe('inventoryApi', () => {
  it('should work', () => {
    expect(inventoryApi()).toEqual('inventory-api');
  });
});
