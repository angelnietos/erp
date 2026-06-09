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
    const match = afterStyles.match(/^styles\s*:\s*\[/);
    if (!match) continue;

    let bracketCount = 1;
    let arrayContent = '';
    let i = stylesIdx + match[0].length;
    let inString = false;
    let stringChar = '';
    while (i < content.length && bracketCount > 0) {
      const char = content[i];
      if (inString) {
        if (char === stringChar && content[i - 1] !== '\\') {
          inString = false;
        }
      } else {
        if (char === '`' || char === "'" || char === '"') {
          inString = true;
          stringChar = char;
        } else if (char === '[') {
          bracketCount++;
        } else if (char === ']') {
          bracketCount--;
        }
      }
      if (bracketCount > 0) {
        arrayContent += char;
      }
      i++;
    }

    console.log(`--- ${filePath} ---`);
    console.log(arrayContent.trim());
    console.log('-------------------------------------------');
  }
});
