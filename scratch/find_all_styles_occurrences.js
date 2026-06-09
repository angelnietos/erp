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
const output = [];

walkDir(rootDir, (filePath) => {
  if (!filePath.endsWith('.ts')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  
  let pos = 0;
  while (true) {
    const idx = content.indexOf('styles:', pos);
    if (idx === -1) break;
    pos = idx + 7;

    // Get 300 characters after styles:
    const snippet = content.substring(idx, idx + 300);
    output.push({
      file: filePath,
      snippet: snippet
    });
  }
});

fs.writeFileSync('scratch/all_styles_snippets.txt', JSON.stringify(output, null, 2));
console.log(`Wrote ${output.length} snippets to scratch/all_styles_snippets.txt`);
