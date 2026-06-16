import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import {
  TEST_TENANT_ID,
  TEST_USER_ID,
  makeAuditLogWriterMock,
  makeClientRow,
  makePrismaClientMock,
} from '../../testing/clients-backend-test-fixtures';

describe('ClientsService', () => {
  let prisma: ReturnType<typeof makePrismaClientMock>;
  let auditLogWriter: ReturnType<typeof makeAuditLogWriterMock>;
  let piiCrypto: { encryptField: (v: string | null | undefined) => string | null; decryptField: (v: string | null | undefined) => string | null };
  let service: ClientsService;

  beforeEach(() => {
    prisma = makePrismaClientMock();
    auditLogWriter = makeAuditLogWriterMock();
    piiCrypto = {
      encryptField: (v) => v ?? null,
      decryptField: (v) => v ?? null,
    };
    service = new ClientsService(prisma as never, auditLogWriter as never, piiCrypto as never);
  });

  it('finds active clients for the current tenant and maps compatibility fields', async () => {
    prisma.client.findMany.mockResolvedValue([makeClientRow()]);

    const result = await service.findAll(TEST_TENANT_ID);

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: { tenantId: TEST_TENANT_ID, deletedAt: null },
      include: {
        contacts: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(result[0]).toMatchObject({
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Cliente Test',
      company: 'Cliente Test',
      status: 'active',
      piiEncryptedAtRest: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    });
  });

  it('throws NotFoundException when a tenant cannot access a client', async () => {
    prisma.client.findFirst.mockResolvedValue(null);

    await expect(service.findOne(TEST_TENANT_ID, 'missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates a client with defaults and writes an audit log', async () => {
    prisma.client.create.mockResolvedValue(
      makeClientRow({
        name: 'Nueva Empresa',
        country: 'ES',
        sector: 'corporate',
        type: 'COMPANY',
      }),
    );

    const result = await service.create(
      TEST_TENANT_ID,
      { company: 'Nueva Empresa', email: 'nueva@test.local' },
      TEST_USER_ID,
    );

    expect(prisma.client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: TEST_TENANT_ID,
          name: 'Nueva Empresa',
          email: 'nueva@test.local',
          country: 'ES',
          sector: 'corporate',
          type: 'COMPANY',
        }),
      }),
    );
    expect(auditLogWriter.record).toHaveBeenCalledWith(
      TEST_USER_ID,
      expect.objectContaining({
        action: 'CREATE',
        targetEntity: 'Client:33333333-3333-4333-8333-333333333333',
      }),
    );
    expect(result.company).toBe('Nueva Empresa');
  });

  it('soft deletes and audits an existing client', async () => {
    prisma.client.findFirst.mockResolvedValue({ name: 'Cliente Baja' });
    prisma.client.update.mockResolvedValue(makeClientRow({ name: 'Cliente Baja' }));

    await expect(
      service.delete(TEST_TENANT_ID, '33333333-3333-4333-8333-333333333333', TEST_USER_ID),
    ).resolves.toEqual({ success: true });

    expect(prisma.client.update).toHaveBeenCalledWith({
      where: { id: '33333333-3333-4333-8333-333333333333' },
      data: { deletedAt: expect.any(Date) },
    });
    expect(auditLogWriter.record).toHaveBeenCalledWith(
      TEST_USER_ID,
      expect.objectContaining({
        action: 'DELETE',
        targetEntity: 'Client:33333333-3333-4333-8333-333333333333',
      }),
    );
  });
});
