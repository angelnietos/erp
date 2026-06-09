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
  
  // Use regex to find styles followed by optional space and colon
  const regex = /styles\s*:/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const idx = match.index;
    const snippet = content.substring(idx, idx + 400);
    output.push({
      file: filePath,
      snippet: snippet,
      index: idx
    });
  }
});

fs.writeFileSync('scratch/all_styles_snippets_regex.txt', JSON.stringify(output, null, 2));
console.log(`Wrote ${output.length} snippets to scratch/all_styles_snippets_regex.txt`);
