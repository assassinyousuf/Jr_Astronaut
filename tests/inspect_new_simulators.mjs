import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000'],
    defaultViewport: { width: 1600, height: 1000 }
  });

  const page = await browser.newPage();
  
  // 1. Navigate to #simulators
  console.log('Navigating to http://localhost:5173/#simulators...');
  await page.goto('http://localhost:5173/#simulators', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3000);

  // Take screenshot of SimulatorsHubPage with Lunar Voyager VAB
  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/inspect_simulators_lunar_voyager.png' });
  console.log('Saved inspect_simulators_lunar_voyager.png');

  // 2. Click Hardcore Survival tab
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Hardcore Orbital Survival')) {
      console.log('Clicking Hardcore Orbital Survival tab...');
      await b.click();
      await sleep(2500);
      break;
    }
  }

  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/inspect_simulators_hardcore.png' });
  console.log('Saved inspect_simulators_hardcore.png');

  // 3. Click Mars Survival tab
  const buttons2 = await page.$$('button');
  for (const b of buttons2) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Mars Planetary Survival')) {
      console.log('Clicking Mars Planetary Survival tab...');
      await b.click();
      await sleep(2000);
      break;
    }
  }

  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/inspect_simulators_mars_survival.png' });
  console.log('Saved inspect_simulators_mars_survival.png');

  await browser.close();
  console.log('All inspections complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
