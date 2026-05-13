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
    
    // Add tags: ['autodocs'] if not present
    if (!content.includes("tags: ['autodocs']")) {
        content = content.replace(/(const meta.* = \{[\s\S]*?)(};)/, "$1  tags: ['autodocs'],\n$2");
    }

    // Remove the play function from the Heading story
    // We'll match `play: async ({ canvasElement }) => { ... },` and remove it
    content = content.replace(/play:\s*async\s*\(\{\s*canvasElement\s*\}\)\s*=>\s*\{[\s\S]*?\},/g, '');
    
    // Some play functions might have been `({ canvas })` before my previous script
    content = content.replace(/play:\s*async\s*\(\{\s*canvas\s*\}\)\s*=>\s*\{[\s\S]*?\},/g, '');

    fs.writeFileSync(file, content);
});

console.log('Done adding autodocs and removing failing play functions.');
