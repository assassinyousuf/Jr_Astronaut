import puppeteer from 'puppeteer-core';

const ARTIFACT_DIR = 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: `${ARTIFACT_DIR}/mentor_widget_verified.png` });
  console.log('Saved: mentor_widget_verified.png');

  // Click it to open the dialog
  const btn = await page.$('.mentor-action-pill-btn, button[aria-label="Ask your mentor"]');
  if (btn) {
    await btn.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: `${ARTIFACT_DIR}/mentor_widget_dialog_open.png` });
    console.log('Saved: mentor_widget_dialog_open.png');
  }

  await browser.close();
})();

