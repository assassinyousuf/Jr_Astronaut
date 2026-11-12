import fs from 'fs';
import path from 'path';

const SRC_DIR = 'c:/Users/User/Desktop/nasa-new/Jr_Astronaut/src';

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const allSourceFiles = getAllFiles(SRC_DIR);
const allContents = allSourceFiles.map(f => ({
  path: f,
  content: fs.readFileSync(f, 'utf8')
}));

const components = fs.readdirSync(path.join(SRC_DIR, 'components'))
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

console.log(`Auditing ${components.length} components...`);

const unimportedComponents = [];

for (const comp of components) {
  const baseName = path.basename(comp, path.extname(comp));
  // check if baseName is imported anywhere in any other source file or App.tsx or main.tsx
  let usageCount = 0;
  for (const file of allContents) {
    if (file.path.endsWith(comp)) continue;
    // Check for import of baseName
    const regex = new RegExp(`\\b${baseName}\\b`);
    if (regex.test(file.content)) {
      usageCount++;
    }
  }
  if (usageCount === 0) {
    unimportedComponents.push(comp);
  }
}

console.log('--- UNIMPORTED COMPONENTS ---');
console.log(JSON.stringify(unimportedComponents, null, 2));

// Check pages
const pages = fs.readdirSync(path.join(SRC_DIR, 'pages'))
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
const unimportedPages = [];
for (const p of pages) {
  const baseName = path.basename(p, path.extname(p));
  let usageCount = 0;
  for (const file of allContents) {
    if (file.path.endsWith(p)) continue;
    const regex = new RegExp(`\\b${baseName}\\b`);
    if (regex.test(file.content)) usageCount++;
  }
  if (usageCount === 0) {
    unimportedPages.push(p);
  }
}

console.log('--- UNIMPORTED PAGES ---');
console.log(JSON.stringify(unimportedPages, null, 2));

// Check data files
const dataFiles = fs.readdirSync(path.join(SRC_DIR, 'data'))
  .filter(f => f.endsWith('.ts'));
const unimportedData = [];
for (const d of dataFiles) {
  const baseName = path.basename(d, path.extname(d));
  let usageCount = 0;
  for (const file of allContents) {
    if (file.path.endsWith(d)) continue;
    const regex = new RegExp(`\\b${baseName}\\b`);
    if (regex.test(file.content)) usageCount++;
  }
  if (usageCount === 0) {
    unimportedData.push(d);
  }
}

console.log('--- UNIMPORTED DATA FILES ---');
console.log(JSON.stringify(unimportedData, null, 2));

