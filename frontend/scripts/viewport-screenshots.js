import playwright from 'playwright';
import fs from 'fs';

const url = process.env.URL || 'http://localhost:5174/';
const outDir = './viewport-screenshots';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: 'iphone-12', width: 390, height: 844 },
  { name: 'pixel-4', width: 412, height: 915 },
  { name: 'ipad', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'desktop', width: 1920, height: 1080 }
];

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    try {
      console.log(`Loading ${url} at ${vp.name} ${vp.width}x${vp.height}`);
      await page.goto(url, { timeout: 60000, waitUntil: 'networkidle' });
      // Give fonts and assets a little extra time
      await page.waitForTimeout(1500);
      const filename = `${outDir}/${vp.name}-${vp.width}x${vp.height}.png`;
      await page.screenshot({ path: filename, fullPage: true, timeout: 60000 });
      console.log('Saved', filename);
    } catch (e) {
      console.error('Failed for', vp.name, e.message);
      // try a fallback: reload with DOMContentLoaded and short wait
      try {
        await page.goto(url, { timeout: 45000, waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
        const filename = `${outDir}/${vp.name}-${vp.width}x${vp.height}-fallback.png`;
        await page.screenshot({ path: filename, fullPage: true, timeout: 60000 });
        console.log('Saved (fallback)', filename);
      } catch (err) {
        console.error('Fallback failed for', vp.name, err.message);
      }
    }
  }

  await browser.close();
})();
