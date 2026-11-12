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

  // 1. Verify Home
  await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2500);
  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/verify_home_fixed.png' });

  // 2. Verify Explore
  await page.goto('http://localhost:5173/#/explore', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2500);
  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/verify_explore_fixed.png' });

  // 3. Verify Mission
  await page.goto('http://localhost:5173/#/mission', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2500);
  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/verify_mission_fixed.png' });

  await browser.close();
  console.log('Verification screenshots captured!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
