export const TEST_TENANT_ID = '11111111-1111-4111-8111-111111111111';
export const TEST_USER_ID = '22222222-2222-4222-8222-222222222222';

export function makeClientRow(overrides: Record<string, unknown> = {}) {
  return {
    id: '33333333-3333-4333-8333-333333333333',
    tenantId: TEST_TENANT_ID,
    name: 'Cliente Test',
    taxId: 'B00000000',
    email: 'cliente@test.local',
    phone: '+34 600 000 000',
    address: 'Calle Test 1',
    city: 'Madrid',
    zipCode: '28001',
    country: 'ES',
    description: 'Cliente de pruebas',
    sector: 'corporate',
    type: 'COMPANY',
    contacts: [],
    eventReports: [],
    budgets: [],
    projects: [],
    rentals: [],
    deletedAt: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

export function makePrismaClientMock() {
  return {
    client: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
}

export function makeAuditLogWriterMock() {
  return {
    record: jest.fn(),
  };
}
