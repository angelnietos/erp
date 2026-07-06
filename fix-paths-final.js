const fs = require('fs');
const path = require('path');

const base = 'libs/browser/feature/events/josanz';

const pathFixes = {
  'libs/browser/feature/events/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/events',
    newPrefix: 'libs/browser/feature/events/josanz/feature-list',
  },
  'libs/browser/feature/equipment/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/equipment',
    newPrefix: 'libs/browser/feature/equipment/josanz/feature-list',
  },
  'libs/browser/feature/vehicles/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/vehicles',
    newPrefix: 'libs/browser/feature/vehicles/josanz/feature-list',
  },
  'libs/browser/feature/staff/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/staff',
    newPrefix: 'libs/browser/feature/staff/josanz/feature-list',
  },
  'libs/browser/feature/billing/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/billing',
    newPrefix: 'libs/browser/feature/billing/josanz/feature-list',
  },
  'libs/browser/feature/catalog/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/catalog',
    newPrefix: 'libs/browser/feature/catalog/josanz/feature-list',
  },
};

function fixFile(filePath, oldPrefix, newPrefix) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.split(oldPrefix).join(newPrefix);
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  Fixed:', filePath.replace(oldPrefix, '').replace(/^.*feature-list\//, ''));
  }
}

Object.keys(pathFixes).forEach(dstDir => {
  const { oldPrefix, newPrefix } = pathFixes[dstDir];
  console.log(`\nFixing ${dstDir}`);

  fixFile(path.join(dstDir, 'project.json'), oldPrefix, newPrefix);
  fixFile(path.join(dstDir, 'jest.config.cts'), oldPrefix, newPrefix);
  fixFile(path.join(dstDir, 'tsconfig.json'), oldPrefix, newPrefix);
  fixFile(path.join(dstDir, 'tsconfig.lib.json'), oldPrefix, newPrefix);
  fixFile(path.join(dstDir, 'tsconfig.spec.json'), oldPrefix, newPrefix);
  fixFile(path.join(dstDir, 'eslint.config.mjs'), oldPrefix, newPrefix);
  fixFile(path.join(dstDir, 'src/index.ts'), oldPrefix, newPrefix);
  fixFile(path.join(dstDir, 'src/lib/lib.routes.ts'), oldPrefix, newPrefix);
});

console.log('\nDone.');
