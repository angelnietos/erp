const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.stories.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('libs/browser/shared/josanz-ui/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import\s+\{\s*expect\s*\}\s+from\s+'storybook\/test';/g, "import { expect, within } from '@storybook/test';");
    content = content.replace(/play:\s*async\s*\(\{\s*canvas\s*\}\)\s*=>\s*\{/g, "play: async ({ canvasElement }) => {\n    const canvas = within(canvasElement);");
    fs.writeFileSync(file, content);
});
console.log('Done!');
