const fs = require('fs');
const path = require('path');

const base = 'libs/browser/feature/events/josanz';

const moves = [
  { from: 'feature-lists/events', to: 'feature-list', domain: 'events' },
  { from: 'feature-lists/equipment', to: '../equipment/josanz/feature-list', domain: 'equipment' },
  { from: 'feature-lists/vehicles', to: '../vehicles/josanz/feature-list', domain: 'vehicles' },
  { from: 'feature-lists/staff', to: '../staff/josanz/feature-list', domain: 'staff' },
  { from: 'feature-lists/billing', to: '../billing/josanz/feature-list', domain: 'billing' },
  { from: 'feature-lists/catalog', to: '../catalog/josanz/feature-list', domain: 'catalog' },
];

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  replacements.forEach(([from, to]) => {
    content = content.split(from).join(to);
  });
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  Updated:', filePath.replace(base, ''));
  }
}

moves.forEach(({ from, to, domain }) => {
  const srcDir = path.join(base, from);
  const dstDir = path.resolve(base, to);

  console.log(`\nProcessing ${from} -> ${to}`);

  // Update project.json
  replaceInFile(path.join(srcDir, 'project.json'), [
    [from, to],
    [path.resolve(base, from), dstDir],
  ]);

  // Update jest.config.cts
  replaceInFile(path.join(srcDir, 'jest.config.cts'), [
    [from, to],
    [path.resolve(base, from), dstDir],
  ]);

  // Update tsconfig paths if needed
  replaceInFile(path.join(srcDir, 'tsconfig.json'), [
    [from, to],
  ]);

  // Update barrel and routes
  replaceInFile(path.join(srcDir, 'src/index.ts'), [
    [from, to],
  ]);
  replaceInFile(path.join(srcDir, 'src/lib/lib.routes.ts'), [
    [from, to],
  ]);

  // Rename directories (best effort)
  try {
    if (!fs.existsSync(dstDir)) {
      fs.renameSync(srcDir, dstDir);
      console.log('  MOVED:', from, '->', to);
    } else {
      console.log('  SKIP move (dest exists):', to);
    }
  } catch (e) {
    console.log('  LOCKED (move later):', e.message.slice(0, 120));
  }
});

console.log('\nDone.');
