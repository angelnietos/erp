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

    const afterStyles = content.substring(stylesIdx, stylesIdx + 100);
    const match = afterStyles.match(/^styles\s*:\s*\[/);
    if (!match) continue;

    // Extract styles array
    let bracketCount = 1;
    let arrayContent = '';
    let i = stylesIdx + match[0].length;
    let inString = false;
    let stringChar = '';
    
    // We also need to keep track of nested brackets/parentheses to not prematurely close or get confused
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

    // Now split the arrayContent by commas, ignoring commas inside strings
    const items = [];
    let currentItem = '';
    inString = false;
    stringChar = '';
    let nestLevel = 0; // track nested braces/brackets/parentheses

    for (let j = 0; j < arrayContent.length; j++) {
      const char = arrayContent[j];
      if (inString) {
        if (char === stringChar && arrayContent[j - 1] !== '\\') {
          inString = false;
        }
        currentItem += char;
      } else {
        if (char === '`' || char === "'" || char === '"') {
          inString = true;
          stringChar = char;
          currentItem += char;
        } else if (char === '(' || char === '{' || char === '[') {
          nestLevel++;
          currentItem += char;
        } else if (char === ')' || char === '}' || char === ']') {
          nestLevel--;
          currentItem += char;
        } else if (char === ',' && nestLevel === 0) {
          items.push(currentItem);
          currentItem = '';
        } else {
          currentItem += char;
        }
      }
    }
    if (currentItem) {
      items.push(currentItem);
    }

    // Analyze each item
    items.forEach((item, index) => {
      // Remove comments (single line and block comments)
      let cleanItem = item.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1').trim();
      if (!cleanItem) return;

      const startsWithQuote = cleanItem.startsWith("'") || cleanItem.startsWith('"') || cleanItem.startsWith('`');
      const endsWithQuote = cleanItem.endsWith("'") || cleanItem.endsWith('"') || cleanItem.endsWith('`');

      if (!startsWithQuote || !endsWithQuote) {
        results.push({
          file: filePath,
          index: index,
          itemValue: cleanItem,
          context: content.substring(stylesIdx - 50, stylesIdx + 150)
        });
      }
    });
  }
});

console.log(`\nFound ${results.length} unquoted/invalid style elements:`);
results.forEach(res => {
  console.log(`File: ${res.file}`);
  console.log(`Position (index): ${res.index}`);
  console.log(`Value: ${res.itemValue}`);
  console.log(`Context:\n${res.context}`);
  console.log('----------------------------------------------------');
});
