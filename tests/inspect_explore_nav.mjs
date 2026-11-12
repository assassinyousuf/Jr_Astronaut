import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto('http://localhost:5173/#/explore', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Find buttons in the category bar
  const buttons = await page.$$eval('.ne-category-bar button', (btns) =>
    btns.map(b => ({ text: b.textContent?.trim(), className: b.className }))
  );
  console.log('Category buttons:', buttons);

  // Click on "Earth & Satellites" button
  const earthSatBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('.ne-category-bar button'));
    return btns.find(b => b.textContent && b.textContent.includes('Earth & Satellites'));
  });

  if (earthSatBtn && earthSatBtn.asElement()) {
    console.log('Clicking Earth & Satellites...');
    await earthSatBtn.asElement().click();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/explore_after_earth_sat_click.png' });
  }

  await browser.close();
})();

