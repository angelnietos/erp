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
  const tc = `${dir}/tsconfig.json`;
  let c = fs.readFileSync(tc, 'utf8');
  c = c.replace(/"extends": "\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/tsconfig\.base\.json"/, '"extends": "../../../../../../tsconfig.base.json"');
  fs.writeFileSync(tc, c);
  console.log('Fixed', dir);
});
