const fs = require('fs');

const snippets = JSON.parse(fs.readFileSync('scratch/all_styles_snippets.txt', 'utf8'));

snippets.forEach((item, index) => {
  const snippet = item.snippet;
  const file = item.file;

  // We want to see styles: [ ... ]
  // Let's check if there is a '[' after 'styles:'
  const colonIdx = snippet.indexOf(':');
  if (colonIdx === -1) return;
  const afterColon = snippet.substring(colonIdx + 1).trim();
  if (!afterColon.startsWith('[')) return;

  // Let's extract the array elements
  // We can do a simple parse of elements inside the first []
  let bracketCount = 1;
  let arrayContent = '';
  let i = 1;
  let inString = false;
  let stringChar = '';
  while (i < afterColon.length && bracketCount > 0) {
    const char = afterColon[i];
    if (inString) {
      if (char === stringChar && afterColon[i - 1] !== '\\') {
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

  // Split the array content by commas, ignoring commas in strings
  const elements = [];
  let currentElement = '';
  inString = false;
  stringChar = '';
  let nestLevel = 0;
  for (let j = 0; j < arrayContent.length; j++) {
    const char = arrayContent[j];
    if (inString) {
      if (char === stringChar && arrayContent[j - 1] !== '\\') {
        inString = false;
      }
      currentElement += char;
    } else {
      if (char === '`' || char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        currentElement += char;
      } else if (char === '(' || char === '{' || char === '[') {
        nestLevel++;
        currentElement += char;
      } else if (char === ')' || char === '}' || char === ']') {
        nestLevel--;
        currentElement += char;
      } else if (char === ',' && nestLevel === 0) {
        elements.push(currentElement.trim());
        currentElement = '';
      } else {
        currentElement += char;
      }
    }
  }
  if (currentElement.trim()) {
    elements.push(currentElement.trim());
  }

  // Filter empty elements or comment elements
  const cleanElements = elements.filter(el => {
    let clean = el.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1').trim();
    return clean.length > 0;
  });

  if (cleanElements.length > 1) {
    console.log(`Snippet #${index} in ${file}:`);
    console.log(`Array length: ${cleanElements.length}`);
    cleanElements.forEach((el, idx) => {
      console.log(`  [${idx}]: ${el}`);
    });
    console.log('----------------------------------------------------');
  }
});
