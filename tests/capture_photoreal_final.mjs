import puppeteer from 'puppeteer-core';

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

  // 1. Visit Mission 1 Flight on the pad
  console.log('Navigating to historic-flight-1...');
  await page.goto('http://localhost:5173/#/mission?game=historic-flight-1', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3000);
  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/final_showcase_pad.png' });

  // 2. Launch rocket: click throttle to 100%
  console.log('Launching rocket...');
  // Find throttle slider or hit Up key or click max button
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');

  // Let it ascend through the lower atmosphere and clouds
  await sleep(4000);
  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/final_showcase_ascent_10km.png' });

  // Ascent higher through stratosphere
  await sleep(5000);
  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/final_showcase_stratosphere_30km.png' });

  // Now inspect Mission 2 (Apollo 11 Saturn V)
  console.log('Navigating to historic-flight-2...');
  await page.goto('http://localhost:5173/#/mission?game=historic-flight-2', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3000);
  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/final_showcase_saturn_pad.png' });

  // Launch Apollo 11
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('ArrowUp');
  }
  await sleep(4500);
  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/final_showcase_saturn_ascent.png' });

  await browser.close();
  console.log('All final showcase screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
