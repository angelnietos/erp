const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'libs', 'browser', 'feature');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('-list.component.ts') || file.endsWith('audit-trail.component.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir(featuresDir);
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let changed = false;

    if (content.includes('searchTerm = signal')) {
        content = content.replace(/searchTerm\s*=\s*signal\(['"]{0,2}['"]{0,2}\);?\s*\n?/g, '');
        content = content.replace(/this\.searchTerm\(\)/g, 'this.masterFilter.query()');
        content = content.replace(/this\.searchTerm\.set\([^)]+\);?\s*\n?/g, '');
        
        fs.writeFileSync(file, content);
        console.log('Updated:', file);
        count++;
    }
});

console.log(`Updated ${count} files.`);
