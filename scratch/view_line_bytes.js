const fs = require('fs');
const content = fs.readFileSync('libs/browser/shared/ui-kit/src/lib/button/button.component.ts', 'utf8');
const lines = content.split('\n');
const line = lines[371]; // 0-indexed line 371 is line 372
console.log('Line 372 text:', JSON.stringify(line));
for (let i = 0; i < line.length; i++) {
  console.log(`Char ${i}: ${line[i]} (code: ${line.charCodeAt(i)})`);
}
