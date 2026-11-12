import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';

const ARTIFACT_DIR = 'C:/Users/User/.gemini/antigravity/brain/a2124d7b-e612-4dc9-ab6b-60fc53e33686';

(async () => {
  console.log('🚀 Starting Student Mentor Chatbot Integration Test...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Locate and click the floating launcher button
  console.log('Clicking floating trigger button...');
  const launcherBtn = await page.$('.copilot-floating-trigger-btn');
  assert.ok(launcherBtn, 'Floating launcher button should exist');
  await launcherBtn.click();
  await new Promise(r => setTimeout(r, 1000));

  // 2. Take screenshot of open Chatbot in Mentor mode
  await page.screenshot({ path: `${ARTIFACT_DIR}/student_mentor_chatbot_open.png` });
  console.log('Saved: student_mentor_chatbot_open.png');

  // Verify Header shows NASA CADET MENTOR
  const headerText = await page.$eval('.copilot-chatbot-window', el => el.textContent);
  assert.match(headerText, /NASA CADET MENTOR/i, 'Header should display NASA CADET MENTOR');
  assert.match(headerText, /MENTOR READY/i, 'Header badge should say MENTOR READY');

  // Helper to send query and get latest assistant reply
  async function askQuestion(query) {
    console.log(`Asking: "${query}"...`);
    const input = await page.$('.copilot-chatbot-window input[type="text"]');
    await input.click({ clickCount: 3 });
    await input.type(query);
    const submitBtn = await page.$('.copilot-chatbot-window button[type="submit"]');
    await submitBtn.click();
    // Wait for response (400ms delay + buffer)
    await new Promise(r => setTimeout(r, 1200));

    const bubbles = await page.$$eval('.copilot-msg-bubble', els => els.map(e => e.textContent));
    return bubbles[bubbles.length - 1] || '';
  }

  // 3. Test Question 1: "Can you help me choose?"
  const reply1 = await askQuestion('Can you help me choose?');
  assert.match(reply1, /You’re not alone/);
  assert.match(reply1, /There may not be a perfect choice/);
  console.log('✅ Choice guidance verified');

  // 4. Test Question 2: "I feel worried and stuck"
  const reply2 = await askQuestion('I feel worried and stuck');
  assert.match(reply2, /you don’t have to solve everything at once/i);
  console.log('✅ Reassurance and empathy verified');

  // 5. Test Question 3: "What about radiation?"
  const reply3 = await askQuestion('What about radiation?');
  assert.match(reply3, /not a medical measurement/);
  assert.match(reply3, /NASA DONKI/);
  console.log('✅ Radiation education and medical caveats verified');

  // 6. Test Question 4: "Where does this data come from?"
  const reply4 = await askQuestion('Where does this data come from?');
  assert.match(reply4, /NASA DONKI/);
  assert.match(reply4, /gameplay effect is not itself a NASA measurement/);
  console.log('✅ Data attribution and scientific caveats verified');

  // 7. Take final screenshot with the full conversation
  await page.screenshot({ path: `${ARTIFACT_DIR}/student_mentor_conversation_verified.png` });
  console.log('Saved: student_mentor_conversation_verified.png');

  await browser.close();
  console.log('🎉 All Student Mentor Chatbot integration tests passed successfully!');
})();
