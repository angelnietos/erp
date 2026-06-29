

const { chromium } = require('C:/Users/amuni/Desktop/josanz-proyect/josanz-erp/node_modules/playwright');
const path = require('path');
const fs = require('fs');
async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  console.log("Navigating to Figma login...");
  await page.goto('https://www.figma.com/login');
  
  // Wait for login form to load
  await page.waitForSelector('input[type="email"]');
  
  console.log("Filling login credentials...");
  await page.fill('input[type="email"]', 'a.heart.in.a.cage.to.siberia@gmail.com');
  await page.fill('input[type="password"]', 'HEARTsiberia21.');
  
  console.log("Submitting login form...");
  await page.click('button[type="submit"]');
  // Wait for post-login navigation or URL change
  console.log("Waiting for navigation after login...");
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log("Navigation timed out, continuing anyway...");
  }
  console.log("Current page URL after login attempt:", page.url());
  const destDir = 'C:/Users/amuni/.gemini/antigravity/brain/d01463ea-2c6b-4745-80ee-eff86887a9f2';
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  await page.screenshot({ path: path.join(destDir, 'login_aftermath.png') });
  // Navigate to login frame
  const loginUrl = 'https://www.figma.com/design/E4vulhxg6pTMCnzFt5fVnJ/Josanz-Audiovisual?node-id=61-1312&p=f&m=dev';
  console.log(`Navigating to Login Frame: ${loginUrl}`);
  await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 60000 }).catch(err => console.log("Navigation error:", err));
  
  console.log("Waiting for Figma workspace to render...");
  await page.waitForTimeout(15000); // Wait 15 seconds to render canvas
  
  const loginScreenshot = path.join(destDir, 'figma_login_61_1312.png');
  await page.screenshot({ path: loginScreenshot, fullPage: false });
  console.log(`Saved screenshot to ${loginScreenshot}`);
  // Navigate to design root frame
  const designRootUrl = 'https://www.figma.com/design/E4vulhxg6pTMCnzFt5fVnJ/Josanz-Audiovisual?node-id=0-1&p=f&m=dev';
  console.log(`Navigating to Design Root Frame: ${designRootUrl}`);
  await page.goto(designRootUrl, { waitUntil: 'networkidle', timeout: 60000 }).catch(err => console.log("Navigation error:", err));
  
  console.log("Waiting for Figma workspace to render...");
  await page.waitForTimeout(15000); // Wait 15 seconds to render canvas
  
  const rootScreenshot = path.join(destDir, 'figma_design_0_1.png');
  await page.screenshot({ path: rootScreenshot, fullPage: false });
  console.log(`Saved screenshot to ${rootScreenshot}`);
  await browser.close();
  console.log("Done!");
}
run().catch(err => {
  console.error("Failed to run screenshot script:", err);
});