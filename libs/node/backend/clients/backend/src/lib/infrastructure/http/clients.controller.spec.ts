import type { Request } from 'express';
import { ClientsController } from './clients.controller';
import { TEST_TENANT_ID, TEST_USER_ID } from '../../../testing/clients-backend-test-fixtures';

describe('ClientsController', () => {
  const clientId = '33333333-3333-4333-8333-333333333333';
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let controller: ClientsController;
  let req: Request;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    controller = new ClientsController(service as never);
    req = {
      user: { tenantId: TEST_TENANT_ID, sub: TEST_USER_ID },
      headers: {},
    } as unknown as Request;
  });

  it('passes tenant context to findAll', async () => {
    service.findAll.mockResolvedValue([]);

    await controller.findAll(req);

    expect(service.findAll).toHaveBeenCalledWith(TEST_TENANT_ID);
  });

  it('passes tenant context and id to findOne', async () => {
    service.findOne.mockResolvedValue({ id: clientId });

    await controller.findOne(req, clientId);

    expect(service.findOne).toHaveBeenCalledWith(TEST_TENANT_ID, clientId);
  });

  it('passes tenant and actor context to create/update/delete commands', async () => {
    const body = { name: 'Cliente API' };
    service.create.mockResolvedValue({ id: clientId });
    service.update.mockResolvedValue({ id: clientId });
    service.delete.mockResolvedValue({ success: true });

    await controller.create(req, body);
    await controller.update(req, clientId, body);
    await controller.delete(req, clientId);

    expect(service.create).toHaveBeenCalledWith(TEST_TENANT_ID, body, TEST_USER_ID);
    expect(service.update).toHaveBeenCalledWith(TEST_TENANT_ID, clientId, body, TEST_USER_ID);
    expect(service.delete).toHaveBeenCalledWith(TEST_TENANT_ID, clientId, TEST_USER_ID);
  });
});
