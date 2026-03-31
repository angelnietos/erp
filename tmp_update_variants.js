const fs = require('fs'); 
const path = './libs/shared/data-access/src/lib/services/theme.service.ts'; 
let code = fs.readFileSync(path, 'utf8'); 

const variantMap = {
  'light': 'solid', 
  'dark': 'glass', 
  'blue': 'flat', 
  'green': 'glass', 
  'purple': 'minimal', 
  'orange': 'solid', 
  'pink': 'glass', 
  'slate': 'neumorphic', 
  'monochrome': 'neumorphic', 
  'metal': 'solid', 
  'arctic': 'minimal', 
  'abyss': 'glass', 
  'forge': 'solid', 
  'nebula': 'flat', 
  'acidLime': 'neumorphic', 
  'ultraViolet': 'minimal', 
  'crimsonCode': 'solid', 
  'mintSignal': 'flat', 
  'coralNeon': 'glass', 
  'vinewood': 'solid', 
  'corporateLight': 'flat', 
  'classicDark': 'solid', 
  'nordicFrost': 'minimal', 
  'vanillaLatte': 'flat', 
  'deepForest': 'neumorphic'
}; 

for (const [t, v] of Object.entries(variantMap)) { 
  const regex = new RegExp('(' + t + ':\\s*\\{[\\s\\S]*?uiVariant:\\s*\\')\\w+(\\')', 'g'); 
  code = code.replace(regex, '$1' + v + '$2'); 
} 

fs.writeFileSync(path, code); 
console.log('Successfully diversified UI variants across all 25 themes!');
