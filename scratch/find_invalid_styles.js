const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== '.angular' && f !== '.nx' && f !== 'dist' && f !== '.kilo') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

const rootDir = process.cwd();
console.log('Searching in:', rootDir);

const invalidFiles = [];

walkDir(rootDir, (filePath) => {
  if (!filePath.endsWith('.ts')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('@Component')) return;

  let pos = 0;
  while (true) {
    const stylesIdx = content.indexOf('styles', pos);
    if (stylesIdx === -1) break;
    pos = stylesIdx + 6;

    const afterStyles = content.substring(stylesIdx, stylesIdx + 100);
    // Matches styles: ` or styles: ' or styles: "
    const nonArrayMatch = afterStyles.match(/^styles\s*:\s*([^\[\s\n])/);
    if (nonArrayMatch) {
      // Check if it matches styleVal (like template literal or string)
      const firstChar = nonArrayMatch[1];
      if (firstChar === '`' || firstChar === "'" || firstChar === '"') {
        invalidFiles.push({
          file: filePath,
          type: 'non-array',
          snippet: afterStyles.substring(0, 80)
        });
      }
    }
  }
});

console.log(`\nFound ${invalidFiles.length} files with non-array styles:`);
invalidFiles.forEach(f => {
  console.log(`- ${f.file}`);
  console.log(`  Snippet: ${f.snippet.replace(/\r?\n/g, ' ')}`);
});
