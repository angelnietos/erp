const fs = require('fs');

const baseTsconfig = JSON.parse(fs.readFileSync('tsconfig.base.json', 'utf8'));
const appTsconfig = JSON.parse(fs.readFileSync('apps/frontend/tsconfig.app.json', 'utf8'));

// Preserved shims from the current app tsconfig
const shims = {
  "@nestjs/common": ["apps/frontend/src/shims/empty.ts"],
  "stream": ["apps/frontend/src/shims/empty.ts"],
  "util": ["apps/frontend/src/shims/empty.ts"],
  "url": ["apps/frontend/src/shims/empty.ts"],
  "class-validator": ["apps/frontend/src/shims/empty.ts"],
  "class-transformer": ["apps/frontend/src/shims/empty.ts"],
  "class-transformer/storage": ["apps/frontend/src/shims/empty.ts"]
};

// Merge paths from tsconfig.base.json
const mergedPaths = { ...baseTsconfig.compilerOptions.paths, ...shims };

// Update app tsconfig
appTsconfig.compilerOptions.paths = mergedPaths;

fs.writeFileSync('apps/frontend/tsconfig.app.json', JSON.stringify(appTsconfig, null, 2), 'utf8');
console.log('Successfully synchronized apps/frontend/tsconfig.app.json paths with tsconfig.base.json.');
