import puppeteer from 'puppeteer-core';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const routes = [
  { name: 'home', hash: '#/' },
  { name: 'explore', hash: '#/explore' },
  { name: 'mission', hash: '#/mission' },
  { name: 'simulators', hash: '#/simulators' },
  { name: 'academy', hash: '#/academy' },
  { name: 'campaign', hash: '#/campaign' },
  { name: 'learning', hash: '#/learning' },
  { name: 'teacher', hash: '#/teacher' },
];

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000'],
    defaultViewport: { width: 1600, height: 1000 }
  });

  const page = await browser.newPage();
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE ERROR] ${err.toString()}`));

  for (const r of routes) {
    const url = `http://localhost:5173/${r.hash}`;
    console.log(`Auditing ${r.name} -> ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(2500);
      const outPath = `C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/audit_${r.name}.png`;
      await page.screenshot({ path: outPath });
      console.log(`Saved screenshot: audit_${r.name}.png`);
    } catch (e) {
      console.error(`Error on route ${r.name}:`, e.message);
    }
  }

  fs.writeFileSync('C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686/audit_console_logs.txt', consoleLogs.join('\n'));
  console.log('Saved console logs.');

  await browser.close();
  console.log('UI/UX Audit complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
