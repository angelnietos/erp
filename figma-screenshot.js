/**
 * Capturas de referencia del archivo Figma «Josanz Audiovisual».
 *
 * Opción A — sincronizar capturas ya hechas (Antigravity):
 *   pnpm run figma:sync-screenshots
 *
 * Opción B — generar nuevas (credenciales solo por env):
 *   $env:FIGMA_EMAIL="tu@email.com"
 *   $env:FIGMA_PASSWORD="tu-password"
 *   $env:FIGMA_HEADLESS="false"   # si Figma muestra CAPTCHA
 *   pnpm run figma:screenshot
 *
 * Salida: docs/figma-reference/screenshots/
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FIGMA_FILE_KEY = 'E4vulhxg6pTMCnzFt5fVnJ';
const FRAMES = [
  { id: '61-1312', name: 'login' },
  { id: '0-1', name: 'design-root' },
];

async function run() {
  const email = process.env.FIGMA_EMAIL?.trim();
  const password = process.env.FIGMA_PASSWORD?.trim();
  if (!email || !password) {
    console.error(
      'Define FIGMA_EMAIL y FIGMA_PASSWORD antes de ejecutar el script.',
    );
    process.exit(1);
  }

  const outDir = path.join(
    __dirname,
    'docs',
    'figma-reference',
    'screenshots',
  );
  fs.mkdirSync(outDir, { recursive: true });

  const headless = process.env.FIGMA_HEADLESS !== 'false';
  console.log(`Launching browser (headless=${headless})...`);
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });

  try {
    console.log('Navigating to Figma login...');
    await page.goto('https://www.figma.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="email"]', { timeout: 60000 });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    if (page.url().includes('/login')) {
      console.warn(
        'Sigue en /login — si hay CAPTCHA, relanza con FIGMA_HEADLESS=false',
      );
    }

    for (const frame of FRAMES) {
      const url = `https://www.figma.com/design/${FIGMA_FILE_KEY}/Josanz-Audiovisual?node-id=${frame.id}&p=f&m=dev`;
      console.log(`Capturing ${frame.name} (${frame.id})...`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(15000);
      const file = path.join(outDir, `figma_${frame.name}_${frame.id.replace('-', '_')}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`Saved ${file}`);
    }
  } finally {
    await browser.close();
  }

  console.log('Done.');
}

run().catch((err) => {
  console.error('figma-screenshot failed:', err);
  process.exit(1);
});
