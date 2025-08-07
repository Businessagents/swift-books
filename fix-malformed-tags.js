import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all TypeScript files recursively
function getAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Fix malformed tags in a file
function fixMalformedTags(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix malformed Card tags
  const malformedPatterns = [
    { pattern: /Card\.RootBody/g, replacement: 'Card.Body' },
    { pattern: /Card\.RootHeader/g, replacement: 'Card.Header' },
    { pattern: /Card\.RootFooter/g, replacement: 'Card.Footer' },
    { pattern: /Card\.RootTitle/g, replacement: 'Card.Title' },
    { pattern: /Card\.Root\.Root/g, replacement: 'Card.Root' },
    { pattern: /Card\.Root\.Body/g, replacement: 'Card.Body' },
    { pattern: /Card\.Root\.Header/g, replacement: 'Card.Header' },
  ];

  malformedPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed malformed tags in: ${filePath}`);
  }
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = getAllTsxFiles(srcDir);

console.log(`Processing ${files.length} files...`);
files.forEach(fixMalformedTags);
console.log('Malformed tag fixes completed!');
