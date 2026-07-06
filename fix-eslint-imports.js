const fs = require('fs');

const libs = [
  'libs/browser/feature/events/josanz/feature-list',
  'libs/browser/feature/equipment/josanz/feature-list',
  'libs/browser/feature/vehicles/josanz/feature-list',
  'libs/browser/feature/staff/josanz/feature-list',
  'libs/browser/feature/billing/josanz/feature-list',
  'libs/browser/feature/catalog/josanz/feature-list',
  'libs/browser/feature/events/josanz/data-access',
  'libs/browser/feature/events/josanz/figma-create-page',
];

libs.forEach(dir => {
  const eslint = `${dir}/eslint.config.mjs`;
  if (fs.existsSync(eslint)) {
    let c = fs.readFileSync(eslint, 'utf8');
    c = c.replace(/import baseConfig from '\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\/eslint\.config\.mjs';/, "import baseConfig from '../../../../../eslint.config.mjs';");
    c = c.replace(/import baseConfig from '\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/eslint\.config\.mjs';/, "import baseConfig from '../../../../../eslint.config.mjs';");
    fs.writeFileSync(eslint, c);
    console.log('Fixed', dir);
  }
});
