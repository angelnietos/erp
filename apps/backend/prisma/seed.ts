import { PrismaClient, Prisma, type Product } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: 'apps/backend/.env' });
loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable');
}

/** Fila para `erpReceipt.createMany` cuando el namespace `Prisma` no exporta aún el input generado. */
type ErpReceiptSeedRow = {
  tenantId: string;
  invoiceId: string;
  amount: number;
  status?: string;
  paymentMethod?: string | null;
  paymentDate?: Date | null;
  dueDate: Date;
  createdAt?: Date;
};

/**
 * Con `PrismaPg`, TS infiere `PrismaClient<..., LogLevel, DefaultArgs>` sin los delegados
 * de modelos Fase 4 en algunos entornos. Intersección explícita (no basta `as PrismaClient`).
 */
type PrismaWithPhase4 = PrismaClient & {
  integrationWebhookDelivery: {
    deleteMany(args: {
      where: { tenantId: string };
    }): Prisma.PrismaPromise<Prisma.BatchPayload>;
  };
  integrationWebhook: {
    deleteMany(args: {
      where: { tenantId: string };
    }): Prisma.PrismaPromise<Prisma.BatchPayload>;
  };
  domainEventRecord: {
    deleteMany(args: {
      where: { tenantId: string };
    }): Prisma.PrismaPromise<Prisma.BatchPayload>;
  };
  erpReceipt: {
    deleteMany(args: {
      where: { tenantId: string };
    }): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createMany(args: {
      data: ErpReceiptSeedRow | ErpReceiptSeedRow[];
      skipDuplicates?: boolean;
    }): Prisma.PrismaPromise<Prisma.BatchPayload>;
  };
  /** Modelo `PlatformUser` (panel SaaS); el delegate existe en runtime tras `prisma generate`. */
  platformUser: {
    upsert(args: {
      where: { email: string };
      update: { password: string; isActive: boolean };
      create: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
      };
    }): Prisma.PrismaPromise<{ id: string; email: string }>;
  };
};

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
}) as unknown as PrismaWithPhase4;

/**
 * Catálogo explícito alineado con `PERMISSIONS_CATALOG` (identity).
 * Los roles con `*` lo llevan además del comodín para que cuentas sin `*` en JWT
 * (p. ej. copias de rol) sigan teniendo acceso granular coherente.
 */
const ALL_APP_PERMISSIONS: readonly string[] = [
  'dashboard.view',
  'users.view',
  'users.manage',
  'roles.manage',
  'tenants.manage',
  'clients.view',
  'clients.manage',
  'products.view',
  'products.manage',
  'inventory.movement',
  'budgets.view',
  'budgets.create',
  'budgets.approve',
  'invoices.view',
  'invoices.submit',
  'rentals.view',
  'rentals.manage',
  'rentals.approve',
  'projects.view',
  'projects.manage',
  'fleet.view',
  'fleet.manage',
  'events.view',
  'events.manage',
  'services.view',
  'services.manage',
  'reports.view',
  'audit.view',
  'delivery.view',
  'delivery.manage',
  'billing.view',
  'verifactu.view',
  'receipts.view',
  'ai.view',
];

function uniquePermissions(perms: readonly string[]): string[] {
  return Array.from(new Set(perms));
}

/** `*` más todo el catálogo granular (SuperAdmin / Administrador). */
const FULL_ACCESS_ROLE_PERMISSIONS = uniquePermissions(['*', ...ALL_APP_PERMISSIONS]);

/** Sin comodín: aprobaciones y contexto de lectura. */
const RESPONSABLE_ROLE_PERMISSIONS = uniquePermissions([
  'dashboard.view',
  'users.view',
  'budgets.view',
  'budgets.approve',
  'rentals.view',
  'rentals.approve',
  'projects.view',
  'clients.view',
  'reports.view',
]);

/** Sin comodín: usuario operativo con navegación básica. */
const BASIC_USER_ROLE_PERMISSIONS = uniquePermissions([
  'dashboard.view',
  'clients.view',
  'products.view',
  'budgets.create',
  'events.view',
  'services.view',
  'projects.view',
]);

/** Removes demo rows for this tenant so `prisma db seed` is idempotent. */
async function clearTenantDemoData(tenantId: string) {
  await prisma.integrationWebhookDelivery.deleteMany({ where: { tenantId } });
  await prisma.integrationWebhook.deleteMany({ where: { tenantId } });
  await prisma.domainEventRecord.deleteMany({ where: { tenantId } });
  await prisma.erpReceipt.deleteMany({ where: { tenantId } });

  await prisma.verifactuQueueItem.deleteMany({ where: { tenantId } });
  await prisma.verifactuLog.deleteMany({ where: { tenantId } });

  const endpointIds = (
    await prisma.verifactuWebhookEndpoint.findMany({
      where: { tenantId },
      select: { id: true },
    })
  ).map((e) => e.id);
  if (endpointIds.length > 0) {
    await prisma.verifactuWebhookDelivery.deleteMany({
      where: { endpointId: { in: endpointIds } },
    });
  }
  await prisma.verifactuWebhookEndpoint.deleteMany({ where: { tenantId } });

  await prisma.invoice.deleteMany({ where: { tenantId } });
  await prisma.deliveryNote.deleteMany({ where: { tenantId } });
  await prisma.budgetItem.deleteMany({ where: { budget: { tenantId } } });
  await prisma.budget.deleteMany({ where: { tenantId } });

  await prisma.rentalItem.deleteMany({ where: { rental: { tenantId } } });
  await prisma.rental.deleteMany({ where: { tenantId } });

  await prisma.inventoryMovement.deleteMany({
    where: { product: { tenantId } },
  });
  await prisma.inventoryReservation.deleteMany({
    where: { product: { tenantId } },
  });
  await prisma.inventory.deleteMany({ where: { product: { tenantId } } });
  await prisma.damageReport.deleteMany({ where: { tenantId } });
  await prisma.product.deleteMany({ where: { tenantId } });
  await prisma.category.deleteMany({ where: { tenantId } });
  await prisma.vehicle.deleteMany({ where: { tenantId } });
  await prisma.projectEvent.deleteMany({ where: { project: { tenantId } } });
  await prisma.eventTechnician.deleteMany({ where: { event: { tenantId } } });
  await prisma.event.deleteMany({ where: { tenantId } });
  await prisma.project.deleteMany({ where: { tenantId } });
  await prisma.technician.deleteMany({ where: { tenantId } });
  await prisma.driver.deleteMany({ where: { tenantId } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).eventReport.deleteMany({ where: { tenantId } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).clientContact.deleteMany({ where: { tenantId } });
  await prisma.client.deleteMany({ where: { tenantId } });

  await prisma.outboxEvent.deleteMany({});
  await prisma.idempotencyKey.deleteMany({});
  await prisma.auditLog.deleteMany({});
  /** Cuentas semilla que no deben borrarse al repetir `db seed`. */
  const SEED_PROTECTED_USER_EMAILS = [
    'admin@josanz.com',
    'root@babooni.com',
    'florina.mahalean@babooni.com',
    'alvaro.ballesteros@babooni.com',
    'alejandro.ballesteros@babooni.com',
    'angel.nieto@babooni.com',
  ] as const;
  await prisma.user.deleteMany({
    where: { tenantId, email: { notIn: [...SEED_PROTECTED_USER_EMAILS] } },
  });
}

async function ensureDefaultRoles(tenantId: string, tenantSlug: string) {
  let superAdminRole = await prisma.role.findFirst({
    where: { tenantId, name: 'SuperAdmin' },
  });
  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        tenantId,
        name: 'SuperAdmin',
        type: 'SUPERADMIN',
        permissions: FULL_ACCESS_ROLE_PERMISSIONS,
        description: 'Super administrador: acceso total y configuración de roles y permisos',
      },
    });
  } else {
    superAdminRole = await prisma.role.update({
      where: { id: superAdminRole.id },
      data: { permissions: FULL_ACCESS_ROLE_PERMISSIONS },
    });
  }

  const isAdminTenant = tenantSlug === 'babooni';

  if (isAdminTenant) {
    const babooniPlatformPerms = uniquePermissions([
      'tenants.manage',
      'users.manage',
      'dashboard.view',
      'reports.view',
    ]);
    let ba = await prisma.role.findFirst({ where: { tenantId, name: 'Admin Babooni' } });
    if (!ba) {
      ba = await prisma.role.create({
        data: {
          tenantId,
          name: 'Admin Babooni',
          type: 'ADMIN',
          permissions: babooniPlatformPerms,
          description: 'Administrador de la plataforma Babooni',
        },
      });
    } else {
      await prisma.role.update({
        where: { id: ba.id },
        data: { permissions: babooniPlatformPerms },
      });
    }
  }

  let adminRole = await prisma.role.findFirst({ where: { tenantId, name: 'Administrador' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        tenantId,
        name: 'Administrador',
        type: 'ADMIN',
        permissions: FULL_ACCESS_ROLE_PERMISSIONS,
        description: 'Control total de la empresa',
      },
    });
  } else {
    adminRole = await prisma.role.update({
      where: { id: adminRole.id },
      data: { permissions: FULL_ACCESS_ROLE_PERMISSIONS },
    });
  }

  let respRole = await prisma.role.findFirst({ where: { tenantId, name: 'Responsable' } });
  if (!respRole) {
    respRole = await prisma.role.create({
      data: {
        tenantId,
        name: 'Responsable',
        type: 'RESPONSIBLE',
        permissions: RESPONSABLE_ROLE_PERMISSIONS,
        description: 'Puede aprobar operaciones y ver contexto operativo',
      },
    });
  } else {
    await prisma.role.update({
      where: { id: respRole.id },
      data: { permissions: RESPONSABLE_ROLE_PERMISSIONS },
    });
  }

  let userRole = await prisma.role.findFirst({ where: { tenantId, name: 'Usuario' } });
  if (!userRole) {
    userRole = await prisma.role.create({
      data: {
        tenantId,
        name: 'Usuario',
        type: 'USER',
        permissions: BASIC_USER_ROLE_PERMISSIONS,
        description: 'Acceso limitado a funcionalidades básicas',
      },
    });
  } else {
    await prisma.role.update({
      where: { id: userRole.id },
      data: { permissions: BASIC_USER_ROLE_PERMISSIONS },
    });
  }

  return adminRole;
}

async function main() {
  console.log('🌱 Seeding database...');

  // 1. BABOONI Tenant
  const babooniTenant = await prisma.tenant.upsert({
    where: { slug: 'babooni' },
    update: {},
    create: {
      name: 'Babooni Technologies',
      slug: 'babooni',
    },
  });

  const babooniAdminRole = await ensureDefaultRoles(babooniTenant.id, 'babooni');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // 1b. Panel SaaS (tabla `platform_users`, sin tenant cliente) — marca Babooni
  await prisma.platformUser.deleteMany({
    where: { email: 'platform@josanz.com' },
  });
  await prisma.platformUser.upsert({
    where: { email: 'platform@babooni.com' },
    update: {
      password: hashedPassword,
      isActive: true,
      firstName: 'Platform',
      lastName: 'Babooni',
    },
    create: {
      email: 'platform@babooni.com',
      password: hashedPassword,
      firstName: 'Platform',
      lastName: 'Babooni',
    },
  });

  // 2. Main Demo Tenant (Josanz)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'josanz' },
    update: {},
    create: {
      name: 'Josanz Audiovisuales',
      slug: 'josanz',
    },
  });

  await ensureDefaultRoles(tenant.id, 'josanz');
  const josanzSuperAdminRole = await prisma.role.findFirstOrThrow({
    where: { tenantId: tenant.id, name: 'SuperAdmin' },
  });

  // 3. Create Admin Users for both
  const babooniAdmin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: babooniTenant.id, email: 'root@babooni.com' } },
    update: { password: hashedPassword },
    create: {
      tenantId: babooniTenant.id,
      email: 'root@babooni.com',
      password: hashedPassword,
      firstName: 'Babooni',
      lastName: 'Root',
    },
  });

  const babooniSuperAdminRole = await prisma.role.findFirstOrThrow({
    where: { tenantId: babooniTenant.id, name: 'SuperAdmin' },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: babooniAdmin.id, roleId: babooniSuperAdminRole.id } },
    update: {},
    create: { userId: babooniAdmin.id, roleId: babooniSuperAdminRole.id },
  });

  const babooniResponsibleRole = await prisma.role.findFirstOrThrow({
    where: { tenantId: babooniTenant.id, name: 'Responsable' },
  });
  /** Equipo Babooni (roles ERP: PM/CEO/CTO → Administrador o Responsable). */
  const babooniTeamSeed = [
    {
      email: 'florina.mahalean@babooni.com',
      firstName: 'Florina',
      lastName: 'Mahalean',
      roleId: babooniResponsibleRole.id,
    },
    {
      email: 'alvaro.ballesteros@babooni.com',
      firstName: 'Alvaro',
      lastName: 'Ballesteros',
      roleId: babooniAdminRole.id,
    },
    {
      email: 'alejandro.ballesteros@babooni.com',
      firstName: 'Alejandro',
      lastName: 'Ballesteros',
      roleId: babooniAdminRole.id,
    },
    {
      email: 'angel.nieto@babooni.com',
      firstName: 'Angel',
      lastName: 'Nieto',
      roleId: babooniResponsibleRole.id,
    },
  ] as const;
  for (const u of babooniTeamSeed) {
    const row = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: babooniTenant.id, email: u.email } },
      update: {
        password: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
      },
      create: {
        tenantId: babooniTenant.id,
        email: u.email,
        password: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
      },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: row.id, roleId: u.roleId } },
      update: {},
      create: { userId: row.id, roleId: u.roleId },
    });
  }

  const admin = await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: 'admin@josanz.com' },
    },
    update: { password: hashedPassword },
    create: {
      tenantId: tenant.id,
      email: 'admin@josanz.com',
      password: hashedPassword,
      firstName: 'Josanz',
      lastName: 'Admin',
    },
  });

  await prisma.userRole.deleteMany({ where: { userId: admin.id } });
  await prisma.userRole.create({
    data: { userId: admin.id, roleId: josanzSuperAdminRole.id },
  });

  const rawApiKey = 'vf_dev_josanz_key';
  const keyHash = createHash('sha256').update(rawApiKey).digest('hex');
  const existingTenantKey = await prisma.tenantApiKey.findFirst({
    where: { tenantId: tenant.id },
    select: { id: true },
  });
  if (existingTenantKey) {
    await prisma.tenantApiKey.update({
      where: { id: existingTenantKey.id },
      data: { keyHash, scopes: ['invoice.submit'], isActive: true },
    });
  } else {
    await prisma.tenantApiKey.create({
      data: {
        tenantId: tenant.id,
        keyHash,
        scopes: ['invoice.submit'],
        isActive: true,
      },
    });
  }

  await prisma.verifactuSeries.upsert({
    where: {
      uq_verifactu_series_tenant_code: { tenantId: tenant.id, code: 'A' },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'A',
      description: 'Serie principal',
    },
  });

  await prisma.verifactuCustomer.upsert({
    where: {
      uq_verifactu_customer_tenant_taxid: {
        tenantId: tenant.id,
        taxId: 'B12345678',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      taxId: 'B12345678',
      name: 'Cliente Demo Verifactu',
      email: 'cliente-demo@josanz.com',
      countryCode: 'ES',
    },
  });

  await clearTenantDemoData(tenant.id);

  const clients = await prisma.$transaction([
    prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: 'Eventos Global S.L.',
        taxId: 'B12345678',
        email: 'info@eventosglobal.es',
        phone: '+34 912 345 678',
        address: 'Calle Serrano 45',
        city: 'Madrid',
        zipCode: '28001',
        sector: 'Entertainment',
        description: 'Cliente principal de eventos corporativos',
        contacts: {
          create: [
            {
              tenantId: tenant.id,
              name: 'Ana López',
              email: 'ana@eventosglobal.es',
              phone: '+34 611 222 333',
              position: 'Directora de Eventos',
              isPrimary: true,
            },
          ],
        },
      },
    }),
    prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: 'Audiovisuales Madrid',
        taxId: 'A87654321',
        email: 'contacto@audiomadrid.es',
        phone: '+34 913 456 789',
        address: 'Polígono Vallecas, Nave 4',
        city: 'Madrid',
        zipCode: '28031',
        sector: 'Production',
        description: 'Partner para producciones a gran escala',
        contacts: {
          create: [
            {
              tenantId: tenant.id,
              name: 'Carlos Ruiz',
              email: 'produccion@audiomadrid.es',
              phone: '+34 622 333 444',
              position: 'Jefe de Producción',
              isPrimary: true,
            },
          ],
        },
      },
    }),
    prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: 'Congresos S.A.',
        taxId: 'B99887766',
        email: 'info@congresos.es',
        phone: '+34 914 567 890',
        address: 'Avenida del Partenón, 5',
        city: 'Madrid',
        zipCode: '28042',
        sector: 'Corporate',
        description: 'Organizador oficial de IFEMA',
        contacts: {
          create: [
            {
              tenantId: tenant.id,
              name: 'María Santos',
              email: 'msantos@congresos.es',
              phone: '+34 633 444 555',
              position: 'Account Manager',
              isPrimary: true,
            },
          ],
        },
      },
    }),
    prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: 'Teatro Lírica Producciones',
        taxId: 'B22334455',
        email: 'admin@lirica.es',
        phone: '+34 915 678 901',
        address: 'Gran Vía 88',
        city: 'Madrid',
        zipCode: '28013',
        sector: 'Entertainment',
        description: 'Producciones teatrales y musicales',
        contacts: {
          create: [
            {
              tenantId: tenant.id,
              name: 'Pedro Vega',
              email: 'pedro@lirica.es',
              phone: '+34 644 555 666',
              position: 'Director Artístico',
              isPrimary: true,
            },
          ],
        },
      },
    }),
  ]);

  // Seed some event reports
  const event1 = await prisma.event.create({
    data: {
      tenantId: tenant.id,
      name: 'Lanzamiento de Producto Tech',
      clientId: clients[0].id,
      startDate: new Date('2026-04-10T09:00:00Z'),
      endDate: new Date('2026-04-10T18:00:00Z'),
      location: 'Palacio de Cristal, Madrid',
      status: 'PLANNED',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).eventReport.create({
    data: {
      tenantId: tenant.id,
      eventId: event1.id,
      clientId: clients[0].id,
      title: 'Informe de Montaje - Lanzamiento Tech',
      content: 'El montaje se completó según lo previsto. Todos los equipos de audio y video están operativos. Se recomienda personal adicional para el desmontaje.',
      authorId: admin.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      tenantId: tenant.id,
      name: 'Producción Audiovisual Comercial',
      clientId: clients[1].id,
      startDate: new Date('2026-05-15T10:00:00Z'),
      endDate: new Date('2026-05-15T22:00:00Z'),
      location: 'Estudios Secundarios, Madrid',
      status: 'PLANNED',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).eventReport.create({
    data: {
      tenantId: tenant.id,
      eventId: event2.id,
      clientId: clients[1].id,
      title: 'Desglose Técnico - Set de Rodaje Comercial',
      content: 'Revisión final completada. Iluminación y plató listos para rodaje cerrado. Queda pendiente la calibración final del proyector láser en la escena nocturna. Cliente (Carlos) firmó el checklist.',
      authorId: admin.id,
    },
  });

  const productDefs = [
    { name: 'Proyector Láser 4K', price: 1500, stock: 10, sku: 'PRJ-4K-001' },
    { name: 'Pantalla LED 100"', price: 800, stock: 5, sku: 'LED-100-001' },
    { name: 'Set de Sonido Premium', price: 600, stock: 15, sku: 'SND-PRM-001' },
    { name: 'Altavoz Autoamplificado', price: 300, stock: 0, sku: 'SPK-AUTO-000' }, // Low stock for tests
    { name: 'Lote de Cableado HDMI', price: 50, stock: 50, sku: 'CBL-HDMI-50' },
  ];

  const insertedProducts: Product[] = [];
  for (const p of productDefs) {
    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name: p.name,
        sku: p.sku,
        description: `Equipo ${p.name} para eventos y rodajes`,
        price: p.price,
        dailyRate: Math.round((p.price / 30) * 100) / 100,
        category: 'AV',
        inventory: {
          create: {
            totalStock: p.stock,
            status: 'AVAILABLE',
          },
        },
      },
    });
    insertedProducts.push(product);
    console.log(`- Created product: ${product.name}`);
  }

  await prisma.inventoryMovement.create({
    data: {
      productId: insertedProducts[0].id,
      type: 'IN',
      quantity: 4,
    },
  });
  await prisma.inventoryMovement.create({
    data: {
      productId: insertedProducts[2].id,
      type: 'OUT',
      quantity: 2,
    },
  });
  console.log('- Created inventory movements');

  const budgetApproved1 = await prisma.budget.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[0].id,
      startDate: new Date('2026-04-10'),
      endDate: new Date('2026-04-15'),
      status: 'ACCEPTED',
      total: 2300,
      items: {
        create: [
          {
            productId: insertedProducts[0].id,
            quantity: 1,
            price: 1500,
            tax: 21,
          },
          {
            productId: insertedProducts[1].id,
            quantity: 1,
            price: 800,
            tax: 21,
          },
        ],
      },
    },
  });

  const budgetApproved2 = await prisma.budget.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[1].id,
      startDate: new Date('2026-04-20'),
      endDate: new Date('2026-04-22'),
      status: 'ACCEPTED',
      total: 1200,
      items: {
        create: [
          {
            productId: insertedProducts[2].id,
            quantity: 2,
            price: 600,
            tax: 21,
          },
        ],
      },
    },
  });

  await prisma.budget.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[2].id,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-03'),
      status: 'DRAFT',
      total: 450,
      items: {
        create: [
          {
            productId: insertedProducts[3].id,
            quantity: 9,
            price: 50,
            tax: 21,
          },
        ],
      },
    },
  });
  console.log('- Created budgets');

  await prisma.inventoryReservation.create({
    data: {
      productId: insertedProducts[0].id,
      quantity: 2,
      startDate: new Date('2026-04-10'),
      endDate: new Date('2026-04-15'),
      referenceType: 'BUDGET',
      referenceId: budgetApproved1.id,
      status: 'CONFIRMED',
    },
  });
  console.log('- Created inventory reservation');

  /** SVG embebido como data URL: evita URLs ficticias que rompen <img> en el detalle de albarán. */
  const demoSignatureDataUrl =
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="100" viewBox="0 0 280 100"><rect fill="#ffffff" width="100%" height="100%" stroke="#94a3b8" stroke-width="1"/><path d="M24 58 Q72 28 120 52 T228 48" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/><text x="140" y="86" text-anchor="middle" font-size="10" fill="#64748b" font-family="system-ui,sans-serif">Firma de demostración (seed)</text></svg>`,
    );

  await prisma.deliveryNote.create({
    data: {
      tenantId: tenant.id,
      budgetId: budgetApproved1.id,
      status: 'signed',
      signatureBlobUrl: demoSignatureDataUrl,
    },
  });

  await prisma.deliveryNote.create({
    data: {
      tenantId: tenant.id,
      budgetId: budgetApproved2.id,
      status: 'pending',
    },
  });
  console.log('- Created delivery notes');

  const hash1 = createHash('sha256').update('hash1').digest('hex');
  const hash2 = createHash('sha256').update('hash2').digest('hex');

  const invoice1 = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      budgetId: budgetApproved1.id,
      invoiceNumber: 'F/2026/0001',
      status: 'PAID',
      type: 'NORMAL',
      total: 2300 * 1.21,
      verifactuStatus: 'SENT',
      currentHash: hash1,
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      budgetId: budgetApproved2.id,
      invoiceNumber: 'F/2026/0002',
      status: 'PENDING',
      type: 'NORMAL',
      total: 1200 * 1.21,
      verifactuStatus: 'PENDING',
      currentHash: hash2,
      previousHash: hash1,
    },
  });
  console.log('- Created invoices');

  await prisma.verifactuLog.create({
    data: {
      invoiceId: invoice1.id,
      tenantId: tenant.id,
      requestPayload: {
        invoiceId: invoice1.id,
        demo: true,
      } as Prisma.InputJsonValue,
      responsePayload: {
        ok: true,
        status: 'ACCEPTED',
      } as Prisma.InputJsonValue,
      status: 'SUCCESS',
    },
  });

  await prisma.verifactuQueueItem.create({
    data: {
      tenantId: tenant.id,
      invoiceId: invoice2.id,
      status: 'PENDING',
      retries: 0,
    },
  });
  console.log('- Created Verifactu log + queue item');

  const webhook = await prisma.verifactuWebhookEndpoint.create({
    data: {
      tenantId: tenant.id,
      eventType: 'invoice.sent',
      url: 'https://example.com/webhooks/verifactu',
      secret: 'dev_webhook_secret_seed_only',
    },
  });

  await prisma.verifactuWebhookDelivery.create({
    data: {
      endpointId: webhook.id,
      tenantId: tenant.id,
      eventType: 'invoice.sent',
      payload: { invoiceNumber: 'F/2026/0001' } as Prisma.InputJsonValue,
      status: 'DELIVERED',
      statusCode: 200,
      responsePayload: { received: true } as Prisma.InputJsonValue,
    },
  });
  console.log('- Created webhook endpoint + delivery');

  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[0].id,
      reference: 'EXP-2026-0001',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-04-30'),
      status: 'ACTIVE',
      pickupLocation: 'Almacén Central',
      dropoffLocation: 'IFEMA Madrid',
      totalPrice: 3200,
      notes: 'Congreso anual — sonido + proyección',
      rentalItems: {
        create: [
          { productId: insertedProducts[0].id, quantity: 2 },
          { productId: insertedProducts[1].id, quantity: 1 },
        ],
      },
    },
  });

  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[1].id,
      reference: 'EXP-2026-0002',
      startDate: new Date('2026-05-05'),
      endDate: new Date('2026-05-08'),
      status: 'DRAFT',
      pickupLocation: 'Almacén Central',
      dropoffLocation: 'Teatro Lope de Vega',
      totalPrice: 1800,
      rentalItems: {
        create: [{ productId: insertedProducts[2].id, quantity: 3 }],
      },
    },
  });

  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[2].id,
      reference: 'EXP-2026-0003',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-10'),
      status: 'COMPLETED',
      pickupLocation: 'Almacén Central',
      dropoffLocation: 'Hotel Marriott',
      totalPrice: 950,
      rentalItems: {
        create: [{ productId: insertedProducts[3].id, quantity: 10 }],
      },
    },
  });

  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[3].id,
      reference: 'EXP-2026-0004',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-02'),
      status: 'CANCELLED',
      pickupLocation: 'Almacén Central',
      dropoffLocation: 'N/A',
      totalPrice: 0,
      notes: 'Cancelado por el cliente',
      rentalItems: {
        create: [{ productId: insertedProducts[0].id, quantity: 1 }],
      },
    },
  });

  // Más alquileres para tener más datos en el listado
  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[0].id,
      reference: 'EXP-2026-0005',
      startDate: new Date('2026-07-15'),
      endDate: new Date('2026-07-20'),
      status: 'ACTIVE',
      pickupLocation: 'Almacén Central',
      dropoffLocation: 'Centro de Convenciones',
      totalPrice: 2850,
      notes: 'Feria tecnológica — stand completo',
      rentalItems: {
        create: [
          { productId: insertedProducts[0].id, quantity: 1 },
          { productId: insertedProducts[1].id, quantity: 1 },
          { productId: insertedProducts[2].id, quantity: 1 },
        ],
      },
    },
  });

  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[1].id,
      reference: 'EXP-2026-0006',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-05'),
      status: 'DRAFT',
      pickupLocation: 'Almacén Central',
      dropoffLocation: 'Estadio Municipal',
      totalPrice: 1650,
      notes: 'Concierto verano — sonido + iluminación',
      rentalItems: {
        create: [
          { productId: insertedProducts[2].id, quantity: 2 },
          { productId: insertedProducts[3].id, quantity: 15 },
        ],
      },
    },
  });

  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[2].id,
      reference: 'EXP-2026-0007',
      startDate: new Date('2026-02-10'),
      endDate: new Date('2026-02-12'),
      status: 'COMPLETED',
      pickupLocation: 'Almacén Central',
      dropoffLocation: 'Hotel AC',
      totalPrice: 1200,
      notes: 'Presentación corporativa',
      rentalItems: {
        create: [
          { productId: insertedProducts[0].id, quantity: 1 },
          { productId: insertedProducts[1].id, quantity: 1 },
        ],
      },
    },
  });

  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[0].id,
      reference: 'EXP-2026-0008',
      startDate: new Date('2026-09-20'),
      endDate: new Date('2026-09-25'),
      status: 'ACTIVE',
      pickupLocation: 'Almacén Central',
      dropoffLocation: 'Palacio de Congresos',
      totalPrice: 4200,
      notes: 'Congreso internacional — equipamiento completo',
      rentalItems: {
        create: [
          { productId: insertedProducts[0].id, quantity: 2 },
          { productId: insertedProducts[1].id, quantity: 2 },
          { productId: insertedProducts[2].id, quantity: 3 },
        ],
      },
    },
  });

  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[1].id,
      reference: 'EXP-2026-0009',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-03'),
      status: 'DRAFT',
      pickupLocation: 'Almacén Central',
      dropoffLocation: 'Teatro Real',
      totalPrice: 1950,
      notes: 'Obra teatral — iluminación escénica',
      rentalItems: {
        create: [
          { productId: insertedProducts[1].id, quantity: 2 },
          { productId: insertedProducts[3].id, quantity: 20 },
        ],
      },
    },
  });

  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[3].id,
      reference: 'EXP-2026-0010',
      startDate: new Date('2026-11-15'),
      endDate: new Date('2026-11-16'),
      status: 'ACTIVE',
      pickupLocation: 'Almacén Central',
      dropoffLocation: 'Auditorio Nacional',
      totalPrice: 2400,
      notes: 'Concierto sinfónico — refuerzo de sonido',
      rentalItems: {
        create: [{ productId: insertedProducts[2].id, quantity: 4 }],
      },
    },
  });

  console.log('- Created rentals + rental items');

  const vehicles = await prisma.$transaction([
    prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        name: 'Mercedes Sprinter L2',
        plate: '4521KMX',
        type: 'van',
        capacity: 1200,
        status: 'available',
        location: 'Madrid — Nave A',
        nextMaintenance: new Date('2026-09-15'),
      },
    }),
    prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        name: 'Iveco Daily Furgón',
        plate: '8834LMN',
        type: 'truck',
        capacity: 3500,
        status: 'in_use',
        location: 'En ruta — Valencia',
        nextMaintenance: new Date('2026-07-01'),
      },
    }),
    prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        name: 'Ford Transit Custom',
        plate: '2910JRB',
        type: 'van',
        capacity: 900,
        status: 'maintenance',
        location: 'Taller autorizado',
        nextMaintenance: new Date('2026-04-05'),
      },
    }),
  ]);
  console.log('- Created vehicles');

  // Seed categories (ids necesarios para productos con categoryRef SERVICE → GET /api/services)
  await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Audio/Video',
      type: 'PRODUCT',
      description: 'Equipos de audio y video',
    },
  });
  await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Sonido',
      type: 'PRODUCT',
      description: 'Equipos de sonido',
    },
  });
  const josanzCategoryPersonal = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Personal',
      type: 'SERVICE',
      description: 'Servicios de personal técnico',
    },
  });
  const josanzCategoryTransport = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Transporte',
      type: 'SERVICE',
      description: 'Servicios de transporte',
    },
  });
  console.log('- Created categories');

  const josanzServiceCatalog: {
    name: string;
    type: string;
    categoryId: string;
    sku: string;
    price: number;
    dailyRate: number;
  }[] = [
    {
      name: 'Streaming evento en vivo',
      type: 'STREAMING',
      categoryId: josanzCategoryPersonal.id,
      sku: 'SRV-STR-001',
      price: 890,
      dailyRate: 120,
    },
    {
      name: 'Producción multicámara',
      type: 'PRODUCCIÓN',
      categoryId: josanzCategoryPersonal.id,
      sku: 'SRV-PRD-001',
      price: 2400,
      dailyRate: 350,
    },
    {
      name: 'Transporte equipo PA',
      type: 'TRANSPORTE',
      categoryId: josanzCategoryTransport.id,
      sku: 'SRV-TRN-001',
      price: 320,
      dailyRate: 85,
    },
    {
      name: 'Técnico de iluminación (jornada)',
      type: 'PERSONAL_TÉCNICO',
      categoryId: josanzCategoryPersonal.id,
      sku: 'SRV-PER-001',
      price: 280,
      dailyRate: 45,
    },
    {
      name: 'Operación cámara / vídeo',
      type: 'VIDEO_TÉCNICO',
      categoryId: josanzCategoryPersonal.id,
      sku: 'SRV-VID-001',
      price: 420,
      dailyRate: 65,
    },
  ];

  for (const s of josanzServiceCatalog) {
    const row = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name: s.name,
        sku: s.sku,
        categoryId: s.categoryId,
        category: 'SERVICE',
        type: s.type,
        price: s.price,
        dailyRate: s.dailyRate,
        description: `Servicio de catálogo — ${s.name}`,
      },
    });
    console.log(`- Created service (catalog): ${row.name}`);
  }

  // Seed technicians
  
  const userDani = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'dani@josanz.com',
      password: hashedPassword,
      firstName: 'Dani',
      lastName: 'Sonido',
    },
  });

  const userAlex = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'alex@josanz.com',
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'Ilu',
    },
  });

  /** Índices: [0] admin, [1] Dani Sonido (dani@josanz.com, AUDIO/RF), [2] Alex Ilu (iluminación). Ids = UUID al insertar. */
  const technicians = await prisma.$transaction([
    prisma.technician.create({
      data: {
        tenantId: tenant.id,
        userId: admin.id,
        hourlyRate: 50,
        skills: ['DIRECTOR', 'SISTEMAS'],
      },
    }),
    prisma.technician.create({
      data: {
        tenantId: tenant.id,
        userId: userDani.id,
        hourlyRate: 40,
        skills: ['AUDIO', 'RF'],
        status: 'ACTIVE',
      },
    }),
    prisma.technician.create({
      data: {
        tenantId: tenant.id,
        userId: userAlex.id,
        hourlyRate: 35,
        skills: ['ILUMINACIÓN', 'ROBÓTICA'],
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log('- Created technicians');

  // Seed drivers
  const drivers = await prisma.$transaction([
    prisma.driver.create({
      data: {
        tenantId: tenant.id,
        name: 'Carlos Ruiz',
        licenseNumber: '123456789',
        licenseType: 'C',
      },
    }),
    prisma.driver.create({
      data: {
        tenantId: tenant.id,
        name: 'Ana López',
        licenseNumber: '987654321',
        licenseType: 'B',
      },
    }),
  ]);
  console.log('- Created drivers');

  // Update vehicles with drivers
  await prisma.vehicle.update({
    where: { id: vehicles[0].id },
    data: { driverId: drivers[0].id },
  });
  await prisma.vehicle.update({
    where: { id: vehicles[1].id },
    data: { driverId: drivers[1].id },
  });
  console.log('- Assigned drivers to vehicles');

  // Seed events
  const events = await prisma.$transaction([
    prisma.event.create({
      data: {
        tenantId: tenant.id,
        name: 'Concierto Verano 2026',
        clientId: clients[0].id,
        startDate: new Date('2026-07-15T20:00:00Z'),
        endDate: new Date('2026-07-15T23:00:00Z'),
        summary: 'Concierto al aire libre con equipo completo',
        location: 'Parque del Retiro, Madrid',
        status: 'COMPLETED',
      },
    }),
    prisma.event.create({
      data: {
        tenantId: tenant.id,
        name: 'Congreso Empresarial',
        clientId: clients[2].id,
        startDate: new Date('2026-09-10T09:00:00Z'),
        endDate: new Date('2026-09-12T18:00:00Z'),
        summary: 'Congreso con presentaciones y eventos sociales',
        location: 'Palacio de Congresos, Madrid',
        status: 'PLANNED',
      },
    }),
  ]);
  console.log('- Created events');

  // Assign technicians to events (Concierto Verano 2026 → Dani Sonido, skills AUDIO/RF)
  await prisma.eventTechnician.create({
    data: {
      eventId: events[0].id,
      technicianId: technicians[1].id,
    },
  });
  console.log('- Assigned technicians to events');

  // Seed projects
  const projects = await prisma.$transaction([
    prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: 'Proyecto Verano Musical',
        description: 'Serie de conciertos de verano',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-31'),
        clientId: clients[0].id,
      },
    }),
    prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: 'Campaña Broadcast 2026',
        description: 'Renovación de equipos de transmisión',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-12-31'),
        clientId: clients[1].id,
      },
    }),
  ]);
  console.log('- Created projects');

  await prisma.rental.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[1].id,
      reference: 'EXP-2026-AUTO-MAD',
      startDate: new Date('2026-04-05'),
      endDate: new Date('2026-04-15'),
      status: 'ACTIVE',
      pickupLocation: 'Sede Madrid',
      dropoffLocation: 'Estudio Audiovisuales',
      totalPrice: 4500,
      notes: 'Alquiler de equipos de cámara y lentes',
      rentalItems: {
        create: [
          { productId: insertedProducts[0].id, quantity: 2 },
          { productId: insertedProducts[1].id, quantity: 1 }
        ]
      }
    }
  });

  // Link events to projects
  await prisma.projectEvent.create({
    data: {
      projectId: projects[0].id,
      eventId: events[0].id,
    },
  });
  console.log('- Linked events to projects');

  // Seed damage reports
  await prisma.damageReport.create({
    data: {
      tenantId: tenant.id,
      productId: insertedProducts[0].id,
      reportedBy: admin.id,
      place: 'Almacén Central',
      description: 'Daño en la carcasa durante el transporte',
      status: 'REPORTED',
      repairCost: 150,
    },
  });
  console.log('- Created damage reports');

  await prisma.outboxEvent.create({
    data: {
      aggregateType: 'Invoice',
      aggregateId: invoice1.id,
      eventType: 'InvoicePaid',
      payload: { invoiceId: invoice1.id } as Prisma.InputJsonValue,
      status: 'PENDING',
    },
  });
  console.log('- Created outbox event');

  await prisma.idempotencyKey.create({
    data: {
      key: 'seed-demo-idempotency',
      scope: 'seed',
      responseJson: { seeded: true } as Prisma.InputJsonValue,
    },
  });
  console.log('- Created idempotency key');

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  await prisma.erpReceipt.createMany({
    data: [
      {
        tenantId: tenant.id,
        invoiceId: invoice1.id,
        amount: 500,
        status: 'PENDING',
        dueDate: new Date(now + 7 * day),
      },
      {
        tenantId: tenant.id,
        invoiceId: invoice2.id,
        amount: 1200.5,
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: new Date(now - 3 * day),
        dueDate: new Date(now - 7 * day),
        createdAt: new Date(now - 10 * day),
      },
      {
        tenantId: tenant.id,
        invoiceId: invoice1.id, // Reused for demo
        amount: 750.25,
        status: 'OVERDUE',
        dueDate: new Date(now - 5 * day),
        createdAt: new Date(now - 14 * day),
      },
      {
        tenantId: tenant.id,
        invoiceId: invoice2.id, // Reused for demo
        amount: 300,
        status: 'CANCELLED',
        dueDate: new Date(now + 14 * day),
        createdAt: new Date(now - 20 * day),
      },
    ],
  });
  console.log('- Seeded erp_receipts (demo)');

  await clearTenantDemoData(babooniTenant.id);
  await seedBabooniTenantDemo(babooniTenant.id);

  console.log('✅ Database seeded successfully!');
}

/**
 * Datos demo para el tenant Babooni (listas inventario / clientes / presupuestos con filas).
 * Idempotente: va después de `clearTenantDemoData(babooniTenant.id)`.
 */
async function seedBabooniTenantDemo(tenantId: string) {
  /** El cuadrante de disponibilidad lista `Technician`, no solo `User`. Tras `clearTenantDemoData` hay que recrearlos. */
  const babooniOpsUsers = await prisma.user.findMany({
    where: {
      tenantId,
      email: {
        in: [
          'root@babooni.com',
          'florina.mahalean@babooni.com',
          'alvaro.ballesteros@babooni.com',
          'alejandro.ballesteros@babooni.com',
          'angel.nieto@babooni.com',
        ],
      },
    },
  });
  const userByEmail = new Map(babooniOpsUsers.map((u) => [u.email, u]));

  const technicianSeeds: { email: string; hourlyRate: number; skills: string[] }[] = [
    { email: 'root@babooni.com', hourlyRate: 55, skills: ['DIRECTOR', 'SISTEMAS'] },
    {
      email: 'florina.mahalean@babooni.com',
      hourlyRate: 48,
      skills: ['PROJECT_MANAGEMENT', 'COORDINACIÓN'],
    },
    {
      email: 'alvaro.ballesteros@babooni.com',
      hourlyRate: 60,
      skills: ['MANAGEMENT', 'ESTRATEGIA'],
    },
    {
      email: 'alejandro.ballesteros@babooni.com',
      hourlyRate: 58,
      skills: ['ARQUITECTURA', 'TECNOLOGÍA'],
    },
    {
      email: 'angel.nieto@babooni.com',
      hourlyRate: 52,
      skills: ['DESARROLLO', 'AV'],
    },
  ];

  for (const row of technicianSeeds) {
    const u = userByEmail.get(row.email);
    if (!u) {
      console.warn(`- Babooni seed: usuario no encontrado para técnico ${row.email}`);
      continue;
    }
    await prisma.technician.upsert({
      where: { userId: u.id },
      update: {
        tenantId,
        hourlyRate: row.hourlyRate,
        skills: row.skills,
        status: 'ACTIVE',
      },
      create: {
        tenantId,
        userId: u.id,
        hourlyRate: row.hourlyRate,
        skills: row.skills,
        status: 'ACTIVE',
      },
    });
  }
  console.log('- Babooni: técnicos / operarios AV (usuarios semilla vinculados)');

  const [clientA, clientB] = await prisma.$transaction([
    prisma.client.create({
      data: {
        tenantId,
        name: 'Biosstel Eventos S.L.',
        taxId: 'B11111111',
        email: 'hola@biosstel.demo',
        phone: '+34 900 000 001',
        address: 'Calle Demo 1',
        city: 'Madrid',
        zipCode: '28001',
        sector: 'Corporate',
        description: 'Cliente demo (seed Babooni)',
        contacts: {
          create: [
            {
              tenantId,
              name: 'Contacto Demo',
              email: 'contacto@biosstel.demo',
              phone: '+34 611 000 001',
              position: 'Compras',
              isPrimary: true,
            },
          ],
        },
      },
    }),
    prisma.client.create({
      data: {
        tenantId,
        name: 'Producciones Norte',
        taxId: 'B22222222',
        email: 'info@pnorte.demo',
        phone: '+34 900 000 002',
        sector: 'Production',
        description: 'Segundo cliente demo Babooni',
        contacts: {
          create: [
            {
              tenantId,
              name: 'María Pérez',
              email: 'maria@pnorte.demo',
              isPrimary: true,
            },
          ],
        },
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.project.create({
      data: {
        tenantId,
        name: 'Proyecto corporativo Biosstel',
        description: 'Montaje audiovisual demo Babooni (seed)',
        status: 'ACTIVE',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-09-30'),
        clientId: clientA.id,
      },
    }),
    prisma.project.create({
      data: {
        tenantId,
        name: 'Tour Producciones Norte',
        description: 'Segundo proyecto demo — referencia en listado',
        status: 'ACTIVE',
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-12-20'),
        clientId: clientB.id,
      },
    }),
  ]);

  const productDefs: {
    name: string;
    sku: string;
    stock: number;
    price: number;
    dailyRate: number;
  }[] = [
    { name: 'Micrófono inalámbrico doble', sku: 'BB-MIC-01', stock: 12, price: 450, dailyRate: 15 },
    { name: 'Mesa digital 16 canales', sku: 'BB-MIX-01', stock: 4, price: 3200, dailyRate: 95 },
    { name: 'Truss aluminio 3 m', sku: 'BB-TRS-01', stock: 24, price: 180, dailyRate: 8 },
  ];

  const inserted: Product[] = [];
  for (const p of productDefs) {
    const product = await prisma.product.create({
      data: {
        tenantId,
        name: p.name,
        sku: p.sku,
        category: 'AV',
        type: 'generic',
        price: p.price,
        dailyRate: p.dailyRate,
        description: `Equipo demo Babooni — ${p.name}`,
        inventory: {
          create: {
            totalStock: p.stock,
            status: 'AVAILABLE',
          },
        },
      },
    });
    inserted.push(product);
  }

  const babooniCatPersonal = await prisma.category.create({
    data: {
      tenantId,
      name: 'Personal técnico',
      type: 'SERVICE',
      description: 'Servicios de personal (Babooni demo)',
    },
  });
  const babooniCatTransport = await prisma.category.create({
    data: {
      tenantId,
      name: 'Logística',
      type: 'SERVICE',
      description: 'Transporte y logística (Babooni demo)',
    },
  });

  const babooniServiceCatalog: {
    name: string;
    type: string;
    categoryId: string;
    sku: string;
    price: number;
    dailyRate: number;
  }[] = [
    {
      name: 'Dirección técnica de evento',
      type: 'PRODUCCIÓN',
      categoryId: babooniCatPersonal.id,
      sku: 'BB-SRV-DIR-01',
      price: 950,
      dailyRate: 220,
    },
    {
      name: 'Streaming multicámara HD',
      type: 'STREAMING',
      categoryId: babooniCatPersonal.id,
      sku: 'BB-SRV-STR-01',
      price: 1200,
      dailyRate: 280,
    },
    {
      name: 'Furgoneta carga PA',
      type: 'TRANSPORTE',
      categoryId: babooniCatTransport.id,
      sku: 'BB-SRV-TRN-01',
      price: 180,
      dailyRate: 95,
    },
    {
      name: 'Técnico de iluminación',
      type: 'PERSONAL_TÉCNICO',
      categoryId: babooniCatPersonal.id,
      sku: 'BB-SRV-ILU-01',
      price: 320,
      dailyRate: 48,
    },
  ];

  for (const s of babooniServiceCatalog) {
    await prisma.product.create({
      data: {
        tenantId,
        name: s.name,
        sku: s.sku,
        categoryId: s.categoryId,
        category: 'SERVICE',
        type: s.type,
        price: s.price,
        dailyRate: s.dailyRate,
        description: `Servicio catálogo Babooni — ${s.name}`,
      },
    });
  }
  console.log('- Babooni: servicios de catálogo (cuenta técnica SERVICE)');

  const budgetApprovedBabooni = await prisma.budget.create({
    data: {
      tenantId,
      clientId: clientA.id,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-03'),
      status: 'APPROVED',
      total: 1620,
      items: {
        create: [
          { productId: inserted[0].id, quantity: 2, price: 450, tax: 21 },
          { productId: inserted[2].id, quantity: 4, price: 180, tax: 21 },
        ],
      },
    },
  });

  await prisma.budget.create({
    data: {
      tenantId,
      clientId: clientB.id,
      startDate: new Date('2026-06-10'),
      endDate: new Date('2026-06-12'),
      status: 'DRAFT',
      total: 6400,
      items: {
        create: [{ productId: inserted[1].id, quantity: 2, price: 3200, tax: 21 }],
      },
    },
  });

  const babooniSignatureDataUrl =
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="100" viewBox="0 0 280 100"><rect fill="#ffffff" width="100%" height="100%" stroke="#94a3b8" stroke-width="1"/><path d="M24 58 Q72 28 120 52 T228 48" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/><text x="140" y="86" text-anchor="middle" font-size="10" fill="#64748b" font-family="system-ui,sans-serif">Firma demo Babooni</text></svg>`,
    );

  await prisma.deliveryNote.create({
    data: {
      tenantId,
      budgetId: budgetApprovedBabooni.id,
      status: 'signed',
      signatureBlobUrl: babooniSignatureDataUrl,
    },
  });
  await prisma.deliveryNote.create({
    data: {
      tenantId,
      budgetId: budgetApprovedBabooni.id,
      status: 'pending',
    },
  });

  const babooniDrivers = await prisma.$transaction([
    prisma.driver.create({
      data: {
        tenantId,
        name: 'Laura Méndez',
        licenseNumber: 'BB-LIC-DRV-01',
        licenseType: 'C',
      },
    }),
    prisma.driver.create({
      data: {
        tenantId,
        name: 'Pablo Ortega',
        licenseNumber: 'BB-LIC-DRV-02',
        licenseType: 'B',
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.vehicle.create({
      data: {
        tenantId,
        name: 'Furgón Babooni L2',
        plate: 'BB900AAA',
        type: 'van',
        capacity: 1100,
        status: 'available',
        location: 'Nave Babooni — Madrid',
        nextMaintenance: new Date('2026-10-01'),
        driverId: babooniDrivers[0].id,
      },
    }),
    prisma.vehicle.create({
      data: {
        tenantId,
        name: 'Camión rigging',
        plate: 'BB900AAB',
        type: 'truck',
        capacity: 3200,
        status: 'in_use',
        location: 'En montaje — IFEMA',
        nextMaintenance: new Date('2026-08-20'),
        driverId: babooniDrivers[1].id,
      },
    }),
    prisma.vehicle.create({
      data: {
        tenantId,
        name: 'Furgoneta sonido',
        plate: 'BB900AAC',
        type: 'van',
        capacity: 850,
        status: 'maintenance',
        location: 'Taller colaborador',
        nextMaintenance: new Date('2026-04-22'),
      },
    }),
  ]);

  await prisma.rental.create({
    data: {
      tenantId,
      clientId: clientA.id,
      reference: 'BB-EXP-2026-0001',
      startDate: new Date('2026-07-08'),
      endDate: new Date('2026-07-10'),
      status: 'ACTIVE',
      pickupLocation: 'Almacén Babooni',
      dropoffLocation: 'Palacio de Congresos',
      totalPrice: 1890,
      notes: 'Alquiler demo — sonido corporativo',
      rentalItems: {
        create: [
          { productId: inserted[0].id, quantity: 4 },
          { productId: inserted[2].id, quantity: 6 },
        ],
      },
    },
  });

  await prisma.rental.create({
    data: {
      tenantId,
      clientId: clientB.id,
      reference: 'BB-EXP-2026-0002',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-03'),
      status: 'DRAFT',
      pickupLocation: 'Almacén Babooni',
      dropoffLocation: 'Cliente (por confirmar)',
      totalPrice: 6400,
      notes: 'Borrador — mesa digital + micrófonos',
      rentalItems: {
        create: [{ productId: inserted[1].id, quantity: 1 }],
      },
    },
  });

  console.log(
    '- Babooni: clientes, proyectos, productos, presupuestos, albaranes, flota y alquileres demo',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
