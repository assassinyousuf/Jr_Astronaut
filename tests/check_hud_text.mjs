import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/#learning?game=NASA-M001', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3500));
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    window.__simState.altitudeKm = 18.5;
    window.__simState.realVy = 800;
    window.__simState.throttle = 1.0;
  });
  await new Promise(r => setTimeout(r, 1000));

  const hudText = await page.evaluate(() => {
    const el = document.querySelector('.primary-telemetry, [class*="telemetry"]');
    return el ? el.innerText : document.body.innerText.slice(0, 400);
  });
  console.log('HUD Telemetry text:\n', hudText);

  const alt = await page.evaluate(() => window.__simState.altitudeKm);
  console.log('window.__simState.altitudeKm:', alt);

  await browser.close();
})();
