import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/#learning?game=NASA-M001', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000));
  const res = await page.evaluate(() => typeof window.__simState);
  console.log('window.__simState type:', res);
  await browser.close();
})();
