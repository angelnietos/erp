const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'libs/browser/shared/josanz-ui/src/lib/components');
const files = fs.readdirSync(componentsDir);

files.forEach(file => {
  if (file.endsWith('.stories.ts')) {
    const filePath = path.join(componentsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix import path: from 4 dots to 3 dots
    content = content.replace(/import { (.*) } from '\.\.\/\.\.\/\.\.\/\.\.\/\.storybook\/story-arg-types'/g, "import { $1 } from '../../../.storybook/story-arg-types'");
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});
