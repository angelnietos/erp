const fs = require('fs');

const libs = [
  'libs/browser/feature/vehicles/josanz/feature-list',
  'libs/browser/feature/staff/josanz/feature-list',
  'libs/browser/feature/billing/josanz/feature-list',
  'libs/browser/feature/catalog/josanz/feature-list',
];

libs.forEach(dir => {
  const domain = dir.match(/feature\/([^/]+)\//)[1];
  const newPrefix = `libs/browser/feature/${domain}/josanz/feature-list`;
  const oldPrefix = `libs/browser/feature/events/josanz/../${domain}/josanz/feature-list`;

  console.log(`\nFixing ${dir}`);

  // Fix project.json
  const projectJson = `${dir}/project.json`;
  if (fs.existsSync(projectJson)) {
    let c = fs.readFileSync(projectJson, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    c = c.replace(/"tags":\s*\[\s*\]/, '"tags": ["type:feature"]');
    fs.writeFileSync(projectJson, c);
    console.log('  Fixed project.json');
  }

  // Fix tsconfig.json extends
  const tsconfig = `${dir}/tsconfig.json`;
  if (fs.existsSync(tsconfig)) {
    let c = fs.readFileSync(tsconfig, 'utf8');
    c = c.replace(/"extends": "\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/tsconfig\.base\.json"/, '"extends": "../../../../../../tsconfig.base.json"');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(tsconfig, c);
    console.log('  Fixed tsconfig.json');
  }

  // Fix tsconfig.lib.json
  const tsconfigLib = `${dir}/tsconfig.lib.json`;
  if (fs.existsSync(tsconfigLib)) {
    let c = fs.readFileSync(tsconfigLib, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(tsconfigLib, c);
    console.log('  Fixed tsconfig.lib.json');
  }

  // Fix tsconfig.spec.json
  const tsconfigSpec = `${dir}/tsconfig.spec.json`;
  if (fs.existsSync(tsconfigSpec)) {
    let c = fs.readFileSync(tsconfigSpec, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(tsconfigSpec, c);
    console.log('  Fixed tsconfig.spec.json');
  }

  // Fix jest.config.cts
  const jestConfig = `${dir}/jest.config.cts`;
  if (fs.existsSync(jestConfig)) {
    let c = fs.readFileSync(jestConfig, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(jestConfig, c);
    console.log('  Fixed jest.config.cts');
  }

  // Fix eslint.config.mjs
  const eslintConfig = `${dir}/eslint.config.mjs`;
  if (fs.existsSync(eslintConfig)) {
    let c = fs.readFileSync(eslintConfig, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(eslintConfig, c);
    console.log('  Fixed eslint.config.mjs');
  }

  // Fix barrel
  const barrel = `${dir}/src/index.ts`;
  if (fs.existsSync(barrel)) {
    let c = fs.readFileSync(barrel, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(barrel, c);
    console.log('  Fixed src/index.ts');
  }

  // Fix routes
  const routes = `${dir}/src/lib/lib.routes.ts`;
  if (fs.existsSync(routes)) {
    let c = fs.readFileSync(routes, 'utf8');
    c = c.split(oldPrefix).join(newPrefix);
    fs.writeFileSync(routes, c);
    console.log('  Fixed src/lib/lib.routes.ts');
  }
});

console.log('\nDone.');
