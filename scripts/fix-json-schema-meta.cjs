/**
 * Angular 21 + Ajv 8: CoreSchemaRegistry fails when a builder/executor schema's
 * `$schema` points at a meta-schema that is not registered (e.g. bare
 * `https://json-schema.org/schema`, or legacy `http://json-schema.org/schema`).
 *
 * - `@storybook/angular` (some pnpm hashes): legacy `http://json-schema.org/schema`
 * - `@nx/angular` (many schemas): `https://json-schema.org/schema`
 *
 * Storybook `browserTarget` can reference `@nx/angular:package`, so both matter.
 * This script patches every hoisted + `.pnpm` copy under node_modules.
 */
const fs = require('fs');
const path = require('path');

const workspaceRoot = path.join(__dirname, '..');

const BAD_SCHEMAS = new Set([
  'http://json-schema.org/schema',
  'https://json-schema.org/schema',
]);

function patchStorybookAngularFile(schemaPath) {
  const text = fs.readFileSync(schemaPath, 'utf8');
  const next = text.replace(
    /\{\s*"[$]schema"\s*:\s*"http:\/\/json-schema\.org\/schema"\s*,/,
    '{',
  );
  if (next !== text) {
    fs.writeFileSync(schemaPath, next, 'utf8');
    process.stdout.write(`[fix-json-schema-meta] storybook/angular ${schemaPath}\n`);
  }
}

function patchStorybookAngularUnderBuilders(buildersDir) {
  if (!fs.existsSync(buildersDir)) return;
  for (const sub of fs.readdirSync(buildersDir, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    const schemaPath = path.join(buildersDir, sub.name, 'schema.json');
    if (fs.existsSync(schemaPath)) patchStorybookAngularFile(schemaPath);
  }
}

function walkSchemaJsonFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkSchemaJsonFiles(p, out);
    else if (ent.name === 'schema.json') out.push(p);
  }
}

function patchNxAngularSchema(schemaPath) {
  let raw;
  try {
    raw = fs.readFileSync(schemaPath, 'utf8');
  } catch {
    return;
  }
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return;
  }
  if (!BAD_SCHEMAS.has(obj.$schema)) return;
  delete obj.$schema;
  const out = JSON.stringify(obj, null, 4) + (raw.endsWith('\n') ? '\n' : '');
  fs.writeFileSync(schemaPath, out, 'utf8');
  process.stdout.write(`[fix-json-schema-meta] nx/angular ${schemaPath}\n`);
}

function patchNxAngularPackage(root) {
  const base = path.join(root, 'node_modules', '@nx', 'angular');
  const schemas = [];
  walkSchemaJsonFiles(base, schemas);
  for (const f of schemas) patchNxAngularSchema(f);
}

function pnpmPackageRoots(pkgDirName) {
  const roots = [];
  const pnpmDir = path.join(workspaceRoot, 'node_modules', '.pnpm');
  if (!fs.existsSync(pnpmDir)) return roots;
  for (const name of fs.readdirSync(pnpmDir)) {
    if (name.startsWith(`${pkgDirName}@`)) {
      roots.push(path.join(pnpmDir, name));
    }
  }
  return roots;
}

// --- @storybook/angular dist/builders/*/schema.json (legacy $schema line) ---
const storybookRoots = [
  path.join(workspaceRoot, 'node_modules', '@storybook', 'angular', 'dist', 'builders'),
  ...pnpmPackageRoots('@storybook+angular').map((r) =>
    path.join(r, 'node_modules', '@storybook', 'angular', 'dist', 'builders'),
  ),
];
for (const buildersDir of storybookRoots) {
  patchStorybookAngularUnderBuilders(buildersDir);
}

// --- @nx/angular **/schema.json ($schema: https://json-schema.org/schema) ---
patchNxAngularPackage(workspaceRoot);
for (const r of pnpmPackageRoots('@nx+angular')) {
  patchNxAngularPackage(r);
}
