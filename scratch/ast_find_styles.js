const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== '.angular' && f !== '.nx' && f !== 'dist' && f !== '.kilo') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

const rootDir = process.cwd();
const anomalies = [];

walkDir(rootDir, (filePath) => {
  if (!filePath.endsWith('.ts')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('@Component')) return;

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node) {
    if (ts.isDecorator(node)) {
      const expression = node.expression;
      if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression) && expression.expression.text === 'Component') {
        if (expression.arguments.length > 0) {
          const arg = expression.arguments[0];
          if (ts.isObjectLiteralExpression(arg)) {
            const stylesProp = arg.properties.find(p => p.name && ts.isIdentifier(p.name) && p.name.text === 'styles');
            if (stylesProp && ts.isPropertyAssignment(stylesProp)) {
              const initializer = stylesProp.initializer;
              
              if (!ts.isArrayLiteralExpression(initializer)) {
                // Not an array!
                anomalies.push({
                  file: filePath,
                  reason: 'styles is not an array',
                  text: initializer.getText(sourceFile)
                });
              } else {
                // It is an array, let's check elements
                initializer.elements.forEach((el, index) => {
                  const isString = ts.isStringLiteral(el) || ts.isNoSubstitutionTemplateLiteral(el) || el.kind === ts.SyntaxKind.TemplateExpression;
                  if (!isString) {
                    anomalies.push({
                      file: filePath,
                      reason: `Element at position ${index} is not a string literal`,
                      elementKind: ts.SyntaxKind[el.kind],
                      text: el.getText(sourceFile)
                    });
                  }
                });
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
});

console.log(`\nFound ${anomalies.length} anomalies in Component styles:`);
anomalies.forEach(a => {
  console.log(`File: ${a.file}`);
  console.log(`Reason: ${a.reason}`);
  if (a.elementKind) console.log(`Element Kind: ${a.elementKind}`);
  console.log(`Text: ${a.text}`);
  console.log('----------------------------------------------------');
});
