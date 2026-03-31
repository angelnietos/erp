const fs = require('fs');
const path = './libs/shared/data-access/src/lib/services/theme.service.ts';
let code = fs.readFileSync(path, 'utf8');

const variantMap = {
  light: 'solid', dark: 'glass', blue: 'solid', green: 'neumorphic', 
  purple: 'minimal', orange: 'solid', pink: 'glass', slate: 'neumorphic', 
  monochrome: 'outline', metal: 'solid', arctic: 'minimal', abyss: 'glass', 
  forge: 'solid', nebula: 'flat', acidLime: 'flat', ultraViolet: 'minimal', 
  crimsonCode: 'solid', mintSignal: 'flat', coralNeon: 'glass', vinewood: 'solid', 
  corporateLight: 'outline', classicDark: 'solid', nordicFrost: 'minimal', 
  vanillaLatte: 'flat', deepForest: 'neumorphic'
};

for (const [t, v] of Object.entries(variantMap)) {
  const marker = t + ': {';
  const startIdx = code.indexOf(marker);
  if (startIdx !== -1) {
    const endIdx = code.indexOf('uiVariant:', startIdx);
    if (endIdx !== -1 && endIdx - startIdx < 500) {
      const lineEnd = code.indexOf('\n', endIdx);
      if (lineEnd !== -1) {
        code = code.substring(0, endIdx) + "uiVariant: '" + v + "'," + code.substring(lineEnd);
      }
    }
  }
}

fs.writeFileSync(path, code);
console.log('Successfully applied structural variants.');
