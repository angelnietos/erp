const fs = require('fs');
const path = require('path');

const base = 'libs/browser/feature/events/josanz';
const moves = [
  { from: 'feature-lists/equipment', to: 'libs/browser/feature/equipment/josanz/feature-list' },
  { from: 'feature-lists/vehicles', to: 'libs/browser/feature/vehicles/josanz/feature-list' },
  { from: 'feature-lists/staff', to: 'libs/browser/feature/staff/josanz/feature-list' },
  { from: 'feature-lists/billing', to: 'libs/browser/feature/billing/josanz/feature-list' },
  { from: 'feature-lists/catalog', to: 'libs/browser/feature/catalog/josanz/feature-list' },
];

moves.forEach(({ from, to }) => {
  const src = path.join(base, from);
  const dst = to;
  if (fs.existsSync(dst)) {
    console.log('Already exists:', dst);
    return;
  }
  try {
    fs.renameSync(src, dst);
    console.log('Moved', from, '->', to);
  } catch (e) {
    console.log('FAIL move', from, '->', to, e.message);
  }
});

console.log('Done moves.');
