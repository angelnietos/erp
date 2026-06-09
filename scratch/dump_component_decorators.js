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
    const componentIdx = content.indexOf('@Component', pos);
    if (componentIdx === -1) break;
    pos = componentIdx + 10;

    // Find the opening parenthesis '(' and bracket '{'
    const openParenIdx = content.indexOf('(', componentIdx);
    if (openParenIdx === -1 || openParenIdx > componentIdx + 50) continue;
    const openBraceIdx = content.indexOf('{', openParenIdx);
    if (openBraceIdx === -1 || openBraceIdx > openParenIdx + 10) continue;

    // Extract the decorator content by matching braces
    let braceCount = 1;
    let decoratorContent = '';
    let i = openBraceIdx + 1;
    let inString = false;
    let stringChar = '';

    while (i < content.length && braceCount > 0) {
      const char = content[i];
      if (inString) {
        if (char === stringChar && content[i - 1] !== '\\') {
          inString = false;
        }
      } else {
        if (char === '`' || char === "'" || char === '"') {
          inString = true;
          stringChar = char;
        } else if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
        }
      }
      if (braceCount > 0) {
        decoratorContent += char;
      }
      i++;
    }

    if (decoratorContent.includes('styles')) {
      console.log(`=== File: ${filePath} ===`);
      // Find the styles property line and print the lines containing it
      const lines = decoratorContent.split('\n');
      let printing = false;
      let printBraceCount = 0;
      lines.forEach((line) => {
        if (line.includes('styles')) {
          printing = true;
        }
        if (printing) {
          console.log(line);
          // Count open and close brackets to know when to stop printing styles property
          const openMatches = line.match(/\[/g);
          const closeMatches = line.match(/\]/g);
          if (openMatches) printBraceCount += openMatches.length;
          if (closeMatches) printBraceCount -= closeMatches.length;
          if (printBraceCount <= 0 && !line.includes('styles')) {
            printing = false;
          }
        }
      });
      console.log('=======================================\n');
    }
  }
});
