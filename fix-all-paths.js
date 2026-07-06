const fs = require('fs');
const path = require('path');

const fixes = {
  'libs/browser/feature/events/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/events',
    newPrefix: 'libs/browser/feature/events/josanz/feature-list',
    jestPreset: '../../../../../../jest.preset.js',
    coverage: '../../../../../../coverage/libs/browser/feature/events/josanz/feature-list',
  },
  'libs/browser/feature/equipment/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/equipment',
    newPrefix: 'libs/browser/feature/equipment/josanz/feature-list',
    jestPreset: '../../../../../../jest.preset.js',
    coverage: '../../../../../../coverage/libs/browser/feature/equipment/josanz/feature-list',
  },
  'libs/browser/feature/vehicles/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/vehicles',
    newPrefix: 'libs/browser/feature/vehicles/josanz/feature-list',
    jestPreset: '../../../../../../jest.preset.js',
    coverage: '../../../../../../coverage/libs/browser/feature/vehicles/josanz/feature-list',
  },
  'libs/browser/feature/staff/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/staff',
    newPrefix: 'libs/browser/feature/staff/josanz/feature-list',
    jestPreset: '../../../../../../jest.preset.js',
    coverage: '../../../../../../coverage/libs/browser/feature/staff/josanz/feature-list',
  },
  'libs/browser/feature/billing/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/billing',
    newPrefix: 'libs/browser/feature/billing/josanz/feature-list',
    jestPreset: '../../../../../../jest.preset.js',
    coverage: '../../../../../../coverage/libs/browser/feature/billing/josanz/feature-list',
  },
  'libs/browser/feature/catalog/josanz/feature-list': {
    oldPrefix: 'libs/browser/feature/events/josanz/feature-lists/catalog',
    newPrefix: 'libs/browser/feature/catalog/josanz/feature-list',
    jestPreset: '../../../../../../jest.preset.js',
    coverage: '../../../../../../coverage/libs/browser/feature/catalog/josanz/feature-list',
  },
};

Object.keys(fixes).forEach(dir => {
  const { oldPrefix, newPrefix, jestPreset, coverage } = fixes[dir];
  console.log(`\nFixing ${dir}`);

  const projectJson = path.join(dir, 'project.json');
  if (fs.existsSync(projectJson)) {
    let c = fs.readFileSync(projectJson, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(projectJson, c);
    console.log('  Fixed project.json');
  }

  const jestConfig = path.join(dir, 'jest.config.cts');
  if (fs.existsSync(jestConfig)) {
    let c = fs.readFileSync(jestConfig, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    // Fix jest preset and coverage
    const lines = c.split('\n');
    const fixed = lines.map(line => {
      if (line.includes('preset:')) {
        return line.replace(/preset:.*/, `preset: '${jestPreset}',`);
      }
      if (line.includes('coverageDirectory:')) {
        return line.replace(/coverageDirectory:.*/, `coverageDirectory:\n    '${coverage}',`);
      }
      return line;
    }).join('\n');
    if (fixed !== c) {
      fs.writeFileSync(jestConfig, fixed);
      console.log('  Fixed jest.config.cts');
    }
  }

  const tsconfig = path.join(dir, 'tsconfig.json');
  if (fs.existsSync(tsconfig)) {
    let c = fs.readFileSync(tsconfig, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(tsconfig, c);
    console.log('  Fixed tsconfig.json');
  }

  const tsconfigLib = path.join(dir, 'tsconfig.lib.json');
  if (fs.existsSync(tsconfigLib)) {
    let c = fs.readFileSync(tsconfigLib, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(tsconfigLib, c);
    console.log('  Fixed tsconfig.lib.json');
  }

  const tsconfigSpec = path.join(dir, 'tsconfig.spec.json');
  if (fs.existsSync(tsconfigSpec)) {
    let c = fs.readFileSync(tsconfigSpec, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(tsconfigSpec, c);
    console.log('  Fixed tsconfig.spec.json');
  }

  const eslint = path.join(dir, 'eslint.config.mjs');
  if (fs.existsSync(eslint)) {
    let c = fs.readFileSync(eslint, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(eslint, c);
    console.log('  Fixed eslint.config.mjs');
  }

  const barrel = path.join(dir, 'src/index.ts');
  if (fs.existsSync(barrel)) {
    let c = fs.readFileSync(barrel, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(barrel, c);
    console.log('  Fixed src/index.ts');
  }

  const routes = path.join(dir, 'src/lib/lib.routes.ts');
  if (fs.existsSync(routes)) {
    let c = fs.readFileSync(routes, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(routes, c);
    console.log('  Fixed src/lib/lib.routes.ts');
  }
});

console.log('\nAll fixed.');
