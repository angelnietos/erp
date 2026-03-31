const fs = require('fs');
const path = 'C:/Users/amuni/Desktop/josanz-proyect/josanz-erp/libs/shared/data-access/src/lib/services/theme.service.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('uiVariant:')) {
  code = code.replace(/bgStyle: 'aurora' \| 'matrix' \| 'nebula' \| 'grid' \| 'bokeh' \| 'spot';/, "bgStyle: 'aurora' | 'matrix' | 'nebula' | 'grid' | 'bokeh' | 'spot';\n  uiVariant: 'glass' | 'solid' | 'flat' | 'neumorphic' | 'minimal';");
  
  const variants = {
    glass: ['dark', 'coral', 'rose', 'mint', 'blue', 'green', 'purple', 'gold'],
    solid: ['classic-dark', 'corporate-light', 'light'],
    flat: ['latte', 'nordic', 'forest-dark'],
    neumorphic: ['slate', 'zinc'],
    minimal: ['neutral', 'orange', 'cyan', 'teal', 'amber', 'indigo', 'lime', 'violet', 'crimson']
  };
  
  const getV = (name) => {
    for(const [v, keys] of Object.entries(variants)){
      if(keys.includes(name)) return v;
    }
    return 'glass';
  };
  
  code = code.replace(/([a-zA-Z0-9\-']+):\s*\{([^}]+)info:\s*'([^']+)'/g, (match, tName, content, infoAttr) => {
    const clean = tName.replace(/'/g, '').trim();
    const v = getV(clean);
    // Be careful, info matches end of block without trailing comma in the replacement capture, so we append after info.
    return `${match},\n    uiVariant: '${v}'`;
  });
  // The first regex was buggy due to bgStyle matching, better to match info since it's the last property.
  
  code = code.replace(/root\.setAttribute\('data-theme', theme\);/, "root.setAttribute('data-theme', theme);\n    root.setAttribute('data-ui-variant', config.uiVariant || 'glass');");
  
  fs.writeFileSync(path, code);
  console.log("Updated theme.service.ts");
} else {
  console.log("Already updated.");
}
