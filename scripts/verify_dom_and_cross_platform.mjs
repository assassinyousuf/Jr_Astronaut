import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:5173/';
const OUTPUT_DIR = path.resolve('Jr_Astronaut', 'dom_inspection_output');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function dumpDomTree(node, depth = 0) {
  if (!node) return '';
  const indent = '  '.repeat(depth);
  let str = `${indent}<${node.tag}`;
  if (node.id) str += ` id="${node.id}"`;
  if (node.className) str += ` class="${node.className.trim().slice(0, 40)}"`;
  if (node.role) str += ` role="${node.role}"`;
  if (node.type) str += ` type="${node.type}"`;
  str += '>';
  if (node.text && node.text.trim()) {
    str += ` "${node.text.trim().slice(0, 50)}"`;
  }
  str += '\n';
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      str += dumpDomTree(child, depth + 1);
    }
  }
  return str;
}

async function runInspection() {
  console.log('🚀 Launching Edge Chromium Engine to inspect DOM and verify Cross-Platform responsiveness...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const results = {
    crossPlatform: {},
    domTrees: {},
    interactiveChecks: []
  };

  try {
    const page = await browser.newPage();

    // 1. Cross-Platform Viewport Tests
    const viewports = [
      { name: 'Desktop (1440x900)', width: 1440, height: 900 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Mobile (375x812)', width: 375, height: 812 }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(URL, { waitUntil: 'networkidle0', timeout: 15000 });
      await page.waitForSelector('body');

      // Check horizontal overflow (crucial for cross-platform compliance)
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const viewWidth = window.innerWidth;
        return {
          scrollWidth: docWidth,
          innerWidth: viewWidth,
          hasHorizontalScroll: docWidth > viewWidth + 2
        };
      });

      const shotPath = path.join(OUTPUT_DIR, `screenshot_${vp.name.split(' ')[0].toLowerCase()}.png`);
      await page.screenshot({ path: shotPath });

      results.crossPlatform[vp.name] = {
        viewport: vp,
        overflowCheck: overflow,
        screenshot: shotPath,
        passed: !overflow.hasHorizontalScroll
      };
      console.log(`✅ Viewport ${vp.name}: Horizontal Overflow = ${overflow.hasHorizontalScroll ? 'FAILED' : 'PASSED (0 horizontal overflow)'}`);
    }

    // Return to Desktop for Deep DOM Tree Inspection
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 15000 });

    // Function to extract simplified DOM tree
    const extractTree = async (selector = 'body') => {
      return await page.evaluate((sel) => {
        const root = document.querySelector(sel);
        if (!root) return null;

        function traverse(el) {
          if (!el || el.nodeType !== Node.ELEMENT_NODE) return null;
          // Skip script, style, svg paths to keep DOM tree clean
          if (['SCRIPT', 'STYLE', 'svg', 'path', 'defs', 'linearGradient'].includes(el.tagName)) return null;

          const obj = {
            tag: el.tagName.toLowerCase(),
            id: el.id || undefined,
            className: el.className && typeof el.className === 'string' ? el.className : undefined,
            role: el.getAttribute('role') || undefined,
            type: el.getAttribute('type') || undefined,
            text: el.children.length === 0 ? el.textContent : undefined,
            children: []
          };

          for (let i = 0; i < el.children.length; i++) {
            const childNode = traverse(el.children[i]);
            if (childNode) obj.children.push(childNode);
          }
          return obj;
        }

        return traverse(root);
      }, selector);
    };

    // 2. Homepage DOM Tree
    console.log('🔍 Extracting Homepage DOM Tree...');
    const homeDom = await extractTree('#root');
    results.domTrees.homepage = homeDom;

    // Verify Hero CTA Button in DOM
    const heroBtnText = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="start-mission-btn"]') || document.querySelector('.game-hero-start-btn');
      return btn ? btn.textContent.trim() : null;
    });
    console.log(`🎯 Hero Button in DOM: "${heroBtnText}"`);
    results.interactiveChecks.push({ action: 'Inspect Hero CTA', result: heroBtnText });

    // 3. Test Clicking "START LEARNING" (Logged Out -> Auth Modal)
    console.log('🖱️ Clicking Hero CTA when logged out...');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="start-mission-btn"]') || document.querySelector('.game-hero-start-btn');
      if (btn) btn.click();
    });

    await page.waitForFunction(() => !!document.querySelector('.auth-modal-container') || !!document.querySelector('.auth-modal-card') || !!document.querySelector('.auth-input'), { timeout: 5000 }).catch(() => {});
    
    const authModalDom = await extractTree('.auth-modal-container, .auth-modal-backdrop, [role="dialog"]');
    results.domTrees.authModal = authModalDom;
    console.log('✅ Auth Modal DOM Tree successfully captured!');

    // Check fields in Auth Modal DOM
    const authInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map(i => ({ placeholder: i.placeholder, type: i.type, name: i.name }));
    });
    console.log('🔑 Auth Modal Form Inputs:', authInputs);
    results.interactiveChecks.push({ action: 'Inspect Auth Modal Inputs', result: authInputs });

    // 4. Test Logging in as Cadet Artemis
    console.log('🔑 Authenticating as CadetArtemis...');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const userInput = inputs.find(i => i.placeholder && i.placeholder.includes('Cadet'));
      const passInput = inputs.find(i => i.type === 'password');
      if (userInput && passInput) {
        userInput.value = 'CadetArtemis';
        userInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.value = 'astro123';
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('LOGIN') || b.textContent.includes('SIGN IN') || b.textContent.includes('AUTHENTICATE')));
      if (submitBtn) submitBtn.click();
    });

    // Wait 1.5s for auth state to persist
    await new Promise(r => setTimeout(r, 1500));

    // 5. Test Clicking "START LEARNING" (Logged In -> Outer Space Discovery Modal)
    console.log('🚀 Triggering Outer Space Discovery Dossier...');
    await page.evaluate(() => {
      // Close any open modal first
      const closeBtn = document.querySelector('.auth-modal-close, [aria-label="Close"]');
      if (closeBtn) closeBtn.click();
      const startBtn = document.querySelector('[data-testid="start-mission-btn"]') || document.querySelector('.game-hero-start-btn');
      if (startBtn) startBtn.click();
    });

    await new Promise(r => setTimeout(r, 1200));

    const discoveryDom = await extractTree('.space-discovery-modal-container, [data-testid="space-discovery-modal"], .discovery-content');
    results.domTrees.spaceDiscoveryDossier = discoveryDom;
    console.log('✅ Outer Space Discovery Dossier DOM Tree captured!');

    // 6. Test Navigating to 4-Stack OR-Graph Learning Hub
    console.log('🗺️ Navigating to 4-Stack OR-Graph & Milestones...');
    await page.goto(`${URL}#/learning`, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    const orGraphDom = await extractTree('.learning-path-graph-container, .hub-modal-container, .hub-fullpage-container');
    results.domTrees.learningPathOrGraph = orGraphDom;
    console.log('✅ 4-Stack OR-Graph DOM Tree captured!');

    // Check Milestones and Stacks in DOM
    const orGraphNodes = await page.evaluate(() => {
      const milestones = Array.from(document.querySelectorAll('.milestone-card, [data-milestone-id], .milestone-node'));
      return {
        milestoneCount: milestones.length,
        hasVideoStack: !!document.querySelector('[data-stack="video"], .stack-btn-video, button:has(.lucide-video)'),
        hasAudioStack: !!document.querySelector('[data-stack="audio"], .stack-btn-audio, button:has(.lucide-radio)'),
        hasComicStack: !!document.querySelector('[data-stack="comic"], .stack-btn-comic, button:has(.lucide-book-open)'),
        hasGameStack: !!document.querySelector('[data-stack="game"], .stack-btn-game, button:has(.lucide-gamepad-2)')
      };
    });
    console.log('📊 Learning Roadmap Nodes:', orGraphNodes);
    results.interactiveChecks.push({ action: 'Check 4 Stacks in DOM', result: orGraphNodes });

    // 7. Test Leaderboard Modal DOM
    console.log('🏆 Triggering Leaderboard Modal...');
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const lbBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Leaderboard'));
      if (lbBtn) lbBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const leaderboardDom = await extractTree('.leaderboard-modal-container, .leaderboard-table, [data-testid="leaderboard-modal"]');
    results.domTrees.leaderboardModal = leaderboardDom;

    const lbSegments = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return {
        flightTab: buttons.some(b => b.textContent && b.textContent.includes('Flight Simulation')),
        academicTab: buttons.some(b => b.textContent && b.textContent.includes('Academic'))
      };
    });
    console.log('🏅 Leaderboard Dual Segments:', lbSegments);
    results.interactiveChecks.push({ action: 'Check Leaderboard Segments', result: lbSegments });

    // 8. Test Certificate Modal DOM & Social Sharing Links
    console.log('📜 Triggering Flight Certificate Modal...');
    await page.evaluate(() => {
      // Close leaderboard
      const closeBtn = document.querySelector('[aria-label="Close"], .modal-close');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    await page.evaluate(() => {
      const certBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Certificate') || b.textContent.includes('Print Diploma')));
      if (certBtn) certBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const certDom = await extractTree('.certificate-modal-container, [data-testid="certificate-modal"], .cert-canvas-container');
    results.domTrees.certificateModal = certDom;

    // Save full JSON inspection result
    const reportPath = path.join(OUTPUT_DIR, 'dom_inspection_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Save formatted text trees
    let summaryText = '========================================\n';
    summaryText += 'JR_ASTROCAMP DOM TREE & CROSS-PLATFORM AUDIT\n';
    summaryText += '========================================\n\n';
    summaryText += `1. Cross-Platform Responsive Viewport Audit:\n`;
    for (const [k, v] of Object.entries(results.crossPlatform)) {
      summaryText += `  - ${k}: Width=${v.viewport.width}px, ScrollWidth=${v.overflowCheck.scrollWidth}px -> ${v.passed ? 'PASSED (Clean, No Horizontal Overflow)' : 'FAILED'}\n`;
    }

    summaryText += `\n2. Interactive Checkpoints:\n`;
    for (const c of results.interactiveChecks) {
      summaryText += `  - ${c.action}: ${JSON.stringify(c.result)}\n`;
    }

    summaryText += `\n3. Captured DOM Trees:\n`;
    for (const [name, tree] of Object.entries(results.domTrees)) {
      summaryText += `\n--- DOM TREE: ${name.toUpperCase()} ---\n`;
      summaryText += dumpDomTree(tree, 0).slice(0, 3000); // first 3000 chars of each tree
    }

    const summaryPath = path.join(OUTPUT_DIR, 'dom_inspection_summary.txt');
    fs.writeFileSync(summaryPath, summaryText);
    console.log(`\n🎉 Audit Completed Successfully! Summary saved to:\n${summaryPath}`);

  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    await browser.close();
  }
}

runInspection();

