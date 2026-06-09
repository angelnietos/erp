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

const results = [];

walkDir(rootDir, (filePath) => {
  if (!filePath.endsWith('.ts')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('@Component')) return;

  let pos = 0;
  while (true) {
    const stylesIdx = content.indexOf('styles', pos);
    if (stylesIdx === -1) break;
    pos = stylesIdx + 6;

    // We look for styles property in the file
    // Let's get the text from styles: onwards
    const afterStyles = content.substring(stylesIdx);
    
    // Find the end of styles definition
    // It can be styles: `...` or styles: [ ... ]
    // Let's parse matching bracket or template literal
    let i = 0;
    while (i < afterStyles.length && afterStyles[i] !== ':' && afterStyles[i] !== '=') {
      i++;
    }
    i++; // past colon
    while (i < afterStyles.length && /\s/.test(afterStyles[i])) {
      i++;
    }

    if (afterStyles[i] === '[') {
      // It's an array
      let bracketCount = 1;
      let arrayContent = '';
      i++;
      let inString = false;
      let stringChar = '';
      while (i < afterStyles.length && bracketCount > 0) {
        const char = afterStyles[i];
        if (inString) {
          if (char === stringChar && afterStyles[i - 1] !== '\\') {
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

      // Check if arrayContent contains `${`
      if (arrayContent.includes('${')) {
        results.push({
          file: filePath,
          content: arrayContent,
          type: 'array'
        });
      }
    } else if (afterStyles[i] === '`') {
      // It's a template literal directly
      let inString = true;
      let stringContent = '';
      i++;
      while (i < afterStyles.length && inString) {
        const char = afterStyles[i];
        if (char === '`' && afterStyles[i - 1] !== '\\') {
          inString = false;
        } else {
          stringContent += char;
        }
        i++;
      }

      if (stringContent.includes('${')) {
        results.push({
          file: filePath,
          content: stringContent,
          type: 'template_literal'
        });
      }
    }
  }
});

console.log(`\nFound ${results.length} files with interpolated styles:`);
results.forEach(res => {
  console.log(`File: ${res.file}`);
  console.log(`Type: ${res.type}`);
  console.log(`Content snippet:\n${res.content.substring(0, 300)}`);
  console.log('----------------------------------------------------');
});
