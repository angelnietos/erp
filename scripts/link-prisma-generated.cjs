/**
 * Prisma generates into node_modules/.prisma/client, but @prisma/client/default.d.ts
 * re-exports from '.prisma/client/default' relative to the package root — TypeScript
 * resolves that to node_modules/@prisma/client/.prisma/client/...
 * Junction: node_modules/@prisma/client/.prisma -> node_modules/.prisma (Windows: 'junction')
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const prismaRoot = path.join(root, 'node_modules', '.prisma');
const linkPath = path.join(root, 'node_modules', '@prisma', 'client', '.prisma');

if (!fs.existsSync(prismaRoot)) {
  process.stderr.write('[link-prisma-generated] skip: node_modules/.prisma missing (run prisma generate first)\n');
  process.exit(0);
}

try {
  if (fs.existsSync(linkPath)) {
    process.stdout.write('[link-prisma-generated] already present\n');
    process.exit(0);
  }
} catch {
  /* ignore */
}

try {
  if (process.platform === 'win32') {
    fs.symlinkSync(prismaRoot, linkPath, 'junction');
  } else {
    const rel = path.relative(path.dirname(linkPath), prismaRoot);
    fs.symlinkSync(rel, linkPath);
  }
  process.stdout.write('[link-prisma-generated] OK\n');
} catch (e) {
  process.stderr.write(`[link-prisma-generated] ${e.message}\n`);
  process.exit(1);
}
