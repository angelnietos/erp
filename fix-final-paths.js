const fs = require('fs');

const libs = [
  'libs/browser/feature/events/josanz/feature-list',
  'libs/browser/feature/equipment/josanz/feature-list',
  'libs/browser/feature/vehicles/josanz/feature-list',
  'libs/browser/feature/staff/josanz/feature-list',
  'libs/browser/feature/billing/josanz/feature-list',
  'libs/browser/feature/catalog/josanz/feature-list',
];

libs.forEach(dir => {
  // Fix tsconfig.json extends
  const tc = fs.readFileSync(`${dir}/tsconfig.json`, 'utf8');
  const fixedTc = tc.replace(/"extends": "\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/tsconfig\.base\.json"/, '"extends": "../../../../../../tsconfig.base.json"');
  fs.writeFileSync(`${dir}/tsconfig.json`, fixedTc);
  console.log('Fixed tsconfig.json:', dir);

  // Fix jest.config.cts coverageDirectory duplicate
  const jest = fs.readFileSync(`${dir}/jest.config.cts`, 'utf8');
  const fixedJest = jest.replace(
    /coverageDirectory:\s*\n\s*'[^']+',\s*\n\s*'[^']+',/,
    (match) => {
      const single = match.split('\n').filter((line, i) => i < 2).join('\n');
      return single;
    }
  );
  fs.writeFileSync(`${dir}/jest.config.cts`, fixedJest);
  console.log('Fixed jest.config.cts:', dir);
});

console.log('Done.');
