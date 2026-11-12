import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686';

async function run() {
  console.log('🚀 Launching Edge to test photorealistic gameplay visuals...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Phaser') || text.includes('THREE') || text.includes('error')) {
      console.log('BROWSER LOG:', text);
    }
  });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5173/#/campaign...');
  await page.goto('http://localhost:5173/#/campaign', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Find a mission card and click Launch
  const launchButtons = await page.$$('button');
  for (const btn of launchButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && (text.includes('SIMULATE') || text.includes('LAUNCH') || text.includes('PLAY'))) {
      console.log('Found launch button:', text.trim());
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2500));

  // Click direct to cockpit or launch
  const buttonsAfterModal = await page.$$('button');
  for (const btn of buttonsAfterModal) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && (text.includes('DIRECT TO COCKPIT') || text.includes('LAUNCH MISSION'))) {
      console.log('Clicking modal launch button:', text.trim());
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 3000));

  console.log('Taking screenshot of gameplay simulation...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gameplay_simulation_view.png') });

  // Switch to 2D engine to verify 2D Phaser graphics
  const engineButtons = await page.$$('button');
  for (const btn of engineButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('2D')) {
      console.log('Switching to 2D engine mode...');
      await btn.click();
      await new Promise(r => setTimeout(r, 2000));
      break;
    }
  }

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gameplay_2d_phaser_view.png') });

  // Also navigate to Simulators Hub to inspect 3D celestial bodies
  console.log('Navigating to http://localhost:5173/#/simulators...');
  await page.goto('http://localhost:5173/#/simulators', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gameplay_simulators_hub.png') });

  await browser.close();
  console.log('✅ Gameplay visual verification complete! Screenshots saved to artifacts.');
}

run().catch(err => {
  console.error('❌ Error during visual verification:', err);
  process.exit(1);
});
