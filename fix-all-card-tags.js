import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixAllCardTags(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Comprehensive fixes for all Card-related malformed tags
  const fixes = [
    // Fix malformed opening tags
    { pattern: /Card\.RootContent/g, replacement: 'Card.Body' },
    { pattern: /Card\.RootDescription/g, replacement: 'Card.Description' },
    { pattern: /Card\.RootHeader/g, replacement: 'Card.Header' },
    { pattern: /Card\.RootTitle/g, replacement: 'Card.Title' },
    { pattern: /Card\.RootFooter/g, replacement: 'Card.Footer' },
    
    // Fix closing tags
    { pattern: /<\/CardContent>/g, replacement: '</Card.Body>' },
    { pattern: /<\/CardDescription>/g, replacement: '</Card.Description>' },
    { pattern: /<\/CardHeader>/g, replacement: '</Card.Header>' },
    { pattern: /<\/CardTitle>/g, replacement: '</Card.Title>' },
    { pattern: /<\/CardFooter>/g, replacement: '</Card.Footer>' },
    { pattern: /<\/CardBody>/g, replacement: '</Card.Body>' },
  ];

  fixes.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed all card tags in: ${filePath}`);
  }
}

// Get all files
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

const srcDir = path.join(__dirname, 'src');
const files = getAllTsxFiles(srcDir);

console.log(`Processing ${files.length} files for comprehensive card tag fixes...`);
files.forEach(fixAllCardTags);
console.log('Comprehensive card tag fixes completed!');
