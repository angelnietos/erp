const fs = require('fs');
const path = require('path');

const dir = 'libs/browser/shared/josanz-ui/src/lib/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.stories.ts'));

files.forEach(file => {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Remove the Heading story completely from all files
    content = content.replace(/export const Heading: Story = \{[\s\S]*?\};\n?/g, '');

    fs.writeFileSync(fullPath, content);
});

console.log('Removed Heading from all components.');
